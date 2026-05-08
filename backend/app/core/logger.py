import logging

logging.getLogger("googleapiclient.discovery_cache").setLevel(logging.ERROR)

logging.basicConfig(
    level=logging.INFO,
    datefmt="%Y-%m-%d.%H:%M:%S",
    format="[%(asctime)s] [%(levelname)s] [%(funcName)s] %(message)s",
)

logger = logging.getLogger(__name__)

logger.setLevel(logging.INFO)
