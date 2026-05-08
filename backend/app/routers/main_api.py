from fastapi import APIRouter, Request, HTTPException

from core.logger import logger
from schemas.main_api import GreetRequest
from services.main_api import greet as greet_service

router = APIRouter(prefix="/jobs")


@router.post("/greet")
async def greet(body: GreetRequest):
    try:
        name = greet_service(body.name)
        return {"name": name}
    except Exception as e:
        logger.error(f"[greet API] - error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# Another get
@router.get("/main")
async def main_api(request: Request):
    try:
        return {"status": "OK"}
    except Exception as e:
        logger.error(f"[main API] - error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
