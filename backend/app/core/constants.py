from os import getenv
from dotenv import load_dotenv

load_dotenv()

ENV_NAME = getenv("ENV_NAME") if getenv("ENV_NAME") else "LOCAL"

# openssl rand -hex 32
middleware_creds = {}
middleware_creds["secret_key"] = getenv("MIDDLEWARE_SECRET", "")

DB_USERNAME = getenv("DB_USERNAME", "")
DB_PASSWORD = getenv("DB_PASSWORD", "")
DB_HOST = getenv("DB_HOST", "")
DB_NAME = getenv("DB_NAME", "")

DATABASE_URL = (
    f"postgresql+asyncpg://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}?ssl=require"
    if all([DB_USERNAME, DB_HOST, DB_NAME])
    else ""
)

JWT_SECRET = getenv("JWT_SECRET", "")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = 180

archia_creds = {
    "base_url": getenv("ARCHIA_BASE_URL", ""),
    "token": getenv("ARCHIA_TOKEN", ""),
}

ARCHIA_CHAT_AGENT = getenv("ARCHIA_CHAT_AGENT", "agent:find-match-agent")
ARCHIA_EVAL_AGENT = getenv("ARCHIA_EVAL_AGENT", "agent:find-match-eval-agent")

AGENT_MESSAGE_LIMIT = int(getenv("AGENT_MESSAGE_LIMIT", "10"))
WORKER_INTERVAL_SECONDS = int(getenv("WORKER_INTERVAL_SECONDS", "30"))
MAX_CONCURRENT_CONVERSATIONS = int(getenv("MAX_CONCURRENT_CONVERSATIONS", "5"))
MAX_ACTIVE_CONVERSATIONS_PER_USER = int(getenv("MAX_ACTIVE_CONVERSATIONS_PER_USER", "10"))
