from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse

from contextlib import asynccontextmanager

from routers import main_api
from routers import auth
from core.logger import logger
from core.constants import *
from dependencies.database import engine
from models.base import Base
import models.user  # noqa: F401

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if engine is not None:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created")
    else:
        logger.warning("No database configured")
    yield
    if engine is not None:
        await engine.dispose()


# docs_url = "/" if ENV_NAME == "DEV" else None
# redoc_url = "/redoc" if ENV_NAME == "DEV" else None
docs_url = None
redoc_url = None
app = FastAPI(
    name="Resumera Internal API",
    docs_url=docs_url,
    redoc_url=redoc_url,
    lifespan=lifespan,
)

# Attach the Limiter instance to the app's state
app.state.limiter = limiter

# Add the SlowAPI middleware
app.add_middleware(SlowAPIMiddleware)


# Handle rate limit exceptions
@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})


app.add_middleware(SessionMiddleware, secret_key=middleware_creds["secret_key"])

app.include_router(main_api.router)
app.include_router(auth.router)


origins = []

if ENV_NAME == "LOCAL":
    origins = ["http://localhost:3000", "http://www.localhost:3000"]

if ENV_NAME == "DEV":
    origins = ["https://dev.resumera.ai", "https://www.dev.resumera.ai"]


if ENV_NAME == "PROD":
    origins = ["https://resumera.ai", "https://www.resumera.ai"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# @app.get("/")
# async def main_func():
#     return {"APP": "RESUMERA"}


@app.get("/health")
@limiter.limit("10/minute")
async def health_check(request: Request):
    logger.info("Health Check")
    return {"status": "healthy"}


@app.get("/env")
@limiter.limit("5/minute")
async def get_env(request: Request):
    logger.info(f"ENV Check: {ENV_NAME}")
    import time

    return {"env": ENV_NAME, "version": 1.0, "time": int(time.time())}
