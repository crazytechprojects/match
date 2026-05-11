import asyncio

from sqlalchemy import select, func

from core.constants import (
    WORKER_INTERVAL_SECONDS,
    MAX_CONCURRENT_CONVERSATIONS,
    archia_creds,
)
from core.logger import logger
from dependencies.database import AsyncSessionLocal
from models.conversation import ConversationParticipant, ConversationStatus
from services.matching import run_matching_cycle
from services.agent_engine import process_conversation

_worker_task: asyncio.Task | None = None
_shutdown_event: asyncio.Event | None = None


async def _get_active_conversation_ids(db) -> list:
    """Return IDs of conversations where both participants are still ACTIVE."""
    result = await db.execute(
        select(ConversationParticipant.conversation_id)
        .where(ConversationParticipant.status == ConversationStatus.ACTIVE)
        .group_by(ConversationParticipant.conversation_id)
        .having(func.count(ConversationParticipant.id) == 2)
    )
    return [row[0] for row in result.all()]


async def _run_cycle():
    if AsyncSessionLocal is None:
        return

    async with AsyncSessionLocal() as db:
        await run_matching_cycle(db)

    async with AsyncSessionLocal() as db:
        convo_ids = await _get_active_conversation_ids(db)

    if not convo_ids:
        return

    logger.info(f"Worker: processing {len(convo_ids)} active conversations")
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_CONVERSATIONS)

    async def _limited(cid):
        async with semaphore:
            try:
                await process_conversation(cid)
            except Exception as e:
                logger.error(f"Worker: conversation {cid} failed — {e}", exc_info=True)

    await asyncio.gather(*[_limited(cid) for cid in convo_ids])


async def _loop():
    logger.info("Agent worker started")
    while not _shutdown_event.is_set():
        try:
            await _run_cycle()
        except Exception as e:
            logger.error(f"Worker cycle error: {e}", exc_info=True)

        try:
            await asyncio.wait_for(_shutdown_event.wait(), timeout=WORKER_INTERVAL_SECONDS)
            break
        except asyncio.TimeoutError:
            continue
    logger.info("Agent worker stopped")


def start_worker():
    global _worker_task, _shutdown_event
    if not archia_creds["base_url"] or not archia_creds["token"]:
        logger.warning("Archia credentials not set — agent worker will NOT start")
        return
    _shutdown_event = asyncio.Event()
    _worker_task = asyncio.create_task(_loop())


def stop_worker():
    if _shutdown_event:
        _shutdown_event.set()
    if _worker_task and not _worker_task.done():
        _worker_task.cancel()
