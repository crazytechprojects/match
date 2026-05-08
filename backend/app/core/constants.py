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
