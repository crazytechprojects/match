from os import getenv
from dotenv import load_dotenv

load_dotenv()

BACKEND_API_ENDPOINT = getenv("BACKEND_API_ENDPOINT")
ENV_NAME = getenv("ENV_NAME")

if not ENV_NAME or ENV_NAME == "local":
    BACKEND_API_ENDPOINT = "http://fastapi-app:8000"
elif ENV_NAME == "dev":
    BACKEND_API_ENDPOINT = "https://i5qx.us-east-2.awsapprunner.com"
