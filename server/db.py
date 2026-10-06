import logging
import os
from urllib.parse import quote_plus

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError

load_dotenv()
logger = logging.getLogger(__name__)

DEFAULT_LOCAL_URI = "mongodb://localhost:27017/linkhub"
DEFAULT_DB_NAME = "linkhub"
REQUIRED_PROD_VARS = (
    "MONGO_USERNAME",
    "MONGO_PASSWORD",
    "MONGO_CLUSTER_URL",
    "MONGO_DATABASE_NAME",
)


def build_mongo_uri() -> str:
    """Build the MongoDB URI from environment variables."""
    if os.getenv("ENV") != "production":
        # Allows overriding locally, e.g. mongodb://host.docker.internal:27017/linkhub
        return os.getenv("MONGO_URI", DEFAULT_LOCAL_URI)

    missing = [var for var in REQUIRED_PROD_VARS if not os.getenv(var)]
    if missing:
        raise RuntimeError(f"Missing required MongoDB env vars: {', '.join(missing)}")

    username = quote_plus(os.environ["MONGO_USERNAME"])
    password = quote_plus(os.environ["MONGO_PASSWORD"])
    cluster = os.environ["MONGO_CLUSTER_URL"]
    db_name = os.environ["MONGO_DATABASE_NAME"]
    return f"mongodb+srv://{username}:{password}@{cluster}/{db_name}?retryWrites=true&w=majority"


# MongoClient connects lazily, so creating it here doesn't block startup.
client = MongoClient(build_mongo_uri(), serverSelectionTimeoutMS=3000)
db = client.get_default_database(default=DEFAULT_DB_NAME)

# Collections
users_collection = db["users"]
links_collection = db["links"]
categories_collection = db["categories"]
otp_collection = db["otps"]
bug_report_collection = db["bugReport"]


def ping_db() -> bool:
    """Return True if MongoDB is reachable."""
    try:
        client.admin.command("ping")
        return True
    except PyMongoError as exc:
        logger.warning("MongoDB ping failed: %s", exc)
        return False
