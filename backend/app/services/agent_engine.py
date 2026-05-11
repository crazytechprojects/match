import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.constants import (
    archia_creds,
    ARCHIA_CHAT_AGENT,
    ARCHIA_EVAL_AGENT,
    AGENT_MESSAGE_LIMIT,
)
from core.logger import logger
from dependencies.database import AsyncSessionLocal
from models.user import User
from models.conversation import (
    Conversation,
    ConversationParticipant,
    ConversationStatus,
    Message,
    MessageSenderType,
)

_TIMEOUT = httpx.Timeout(connect=10.0, read=600.0, write=30.0, pool=10.0)


def _extract_final_text(response_data: dict) -> str:
    final_text = None
    for output_item in response_data.get("output", []):
        if output_item.get("type") == "message":
            for content_item in output_item.get("content", []):
                if content_item.get("type") == "output_text":
                    final_text = content_item.get("text")
    return final_text if final_text else "No response generated"


def _build_message_history(
    messages: list[Message], perspective_user_id
) -> list[dict[str, str]]:
    """Convert DB messages into Archia input format from one agent's point of view."""
    history: list[dict[str, str]] = []
    for msg in messages:
        role = "assistant" if msg.sender_user_id == perspective_user_id else "user"
        history.append({"role": role, "content": msg.text})
    return history


async def _call_archia(
    agent_model: str,
    input_messages: list[dict[str, str]],
    prompt_vars: dict | None = None,
) -> str:
    if not archia_creds["base_url"] or not archia_creds["token"]:
        raise RuntimeError("Archia credentials are not configured")

    url = archia_creds["base_url"] + "/v1/responses"
    headers = {
        "Authorization": "Bearer " + archia_creds["token"],
        "Content-Type": "application/json",
    }
    body: dict = {
        "model": agent_model,
        "input": input_messages,
    }
    if prompt_vars:
        body["metadata"] = {"prompt_vars": prompt_vars}

    logger.info(
        f"Archia request → model={agent_model}, "
        f"input_count={len(input_messages)}, "
        f"prompt_vars={list(prompt_vars.keys()) if prompt_vars else None}"
    )
    if input_messages:
        logger.info(f"Archia first input: {input_messages[0]}")

    async with httpx.AsyncClient(http2=True, timeout=_TIMEOUT) as client:
        response = await client.post(url, headers=headers, json=body)

    if response.is_error:
        logger.error(
            f"Archia error: status={response.status_code}, "
            f"model={agent_model}, "
            f"body={response.text}, "
            f"request_payload={body}"
        )
        response.raise_for_status()

    data = response.json()
    result = _extract_final_text(data)
    logger.info(f"Archia response ← model={agent_model}, text={result[:100]}...")
    return result


async def _chat(
    input_messages: list[dict[str, str]], user: User
) -> str:
    if not input_messages:
        input_messages = [{"role": "user", "content": "Start the conversation. Introduce yourself and the person you represent."}]
    return await _call_archia(
        ARCHIA_CHAT_AGENT,
        input_messages,
        prompt_vars={
            "user_name": user.name or "Not specified",
            "user_gender": user.gender or "Not specified",
            "self_description": user.self_description or "",
            "match_description": user.match_description or "",
        },
    )


def _format_chat_transcript(
    messages: list[Message], perspective_user_id
) -> str:
    """Format the full conversation as a readable transcript for the eval agent."""
    lines: list[str] = []
    for msg in messages:
        label = "Agent 1" if msg.sender_user_id == perspective_user_id else "Agent 2"
        lines.append(f"{label}: {msg.text}")
    return "\n".join(lines)


async def _evaluate(
    messages: list[Message], user: User
) -> bool:
    transcript = _format_chat_transcript(messages, user.id)
    answer = await _call_archia(
        ARCHIA_EVAL_AGENT,
        [{"role": "user", "content": transcript}],
        prompt_vars={
            "user_name": user.name or "Not specified",
            "self_description": user.self_description or "",
            "match_description": user.match_description or "",
        },
    )
    return answer.strip().lower().startswith("true")


async def process_conversation(conversation_id) -> None:
    """
    Run the full agent-to-agent chat for one conversation, then evaluate both
    sides and set GREEN / YELLOW / RED statuses.
    """
    if AsyncSessionLocal is None:
        return

    async with AsyncSessionLocal() as db:
        convo = await _load_conversation(db, conversation_id)
        if convo is None:
            return

        participants = convo.participants
        if len(participants) != 2:
            logger.warning(f"Conversation {conversation_id} has {len(participants)} participants, skipping")
            return

        if any(p.status != ConversationStatus.ACTIVE for p in participants):
            return

        user_a: User = participants[0].user
        user_b: User = participants[1].user

        current_messages: list[Message] = list(convo.messages)
        messages_needed = AGENT_MESSAGE_LIMIT - len(current_messages)

        for i in range(messages_needed):
            turn_index = len(convo.messages) + i
            if turn_index % 2 == 0:
                acting_user = user_a
            else:
                acting_user = user_b

            history = _build_message_history(current_messages, acting_user.id)

            try:
                text = await _chat(history, acting_user)
            except Exception as e:
                logger.error(f"Archia chat call failed (convo {conversation_id}): {e}")
                await db.commit()
                return

            new_msg = Message(
                conversation_id=convo.id,
                sender_user_id=acting_user.id,
                sender_type=MessageSenderType.MY_AGENT,
                text=text,
                is_ai=True,
            )
            db.add(new_msg)
            await db.commit()
            await db.refresh(new_msg)
            current_messages.append(new_msg)

        # --- Evaluation ---
        try:
            match_a = await _evaluate(current_messages, user_a)
            match_b = await _evaluate(current_messages, user_b)
        except Exception as e:
            logger.error(f"Evaluation failed (convo {conversation_id}): {e}")
            return

        _apply_statuses(participants, user_a.id, match_a, match_b)
        await db.commit()

        logger.info(
            f"Conversation {conversation_id} done — "
            f"A={'match' if match_a else 'no'}, B={'match' if match_b else 'no'}"
        )


async def _load_conversation(
    db: AsyncSession, conversation_id
) -> Conversation | None:
    result = await db.execute(
        select(Conversation)
        .where(Conversation.id == conversation_id)
        .options(
            selectinload(Conversation.participants).selectinload(
                ConversationParticipant.user
            ),
            selectinload(Conversation.messages),
        )
    )
    return result.scalar_one_or_none()


def _apply_statuses(participants, user_a_id, match_a: bool, match_b: bool):
    """
    | A says | B says | A status | B status |
    |--------|--------|----------|----------|
    | match  | match  | GREEN    | GREEN    |
    | match  | no     | YELLOW   | RED      |
    | no     | match  | RED      | YELLOW   |
    | no     | no     | RED      | RED      |
    """
    for p in participants:
        is_a = p.user_id == user_a_id
        my_vote = match_a if is_a else match_b
        their_vote = match_b if is_a else match_a

        if my_vote and their_vote:
            p.status = ConversationStatus.GREEN
        elif my_vote and not their_vote:
            p.status = ConversationStatus.YELLOW
        else:
            p.status = ConversationStatus.RED
