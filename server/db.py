from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

mongo_username = os.getenv("MONGO_USERNAME")
mongo_password = os.getenv("MONGO_PASSWORD")
mongo_cluster = os.getenv("MONGO_CLUSTER_URL")
mongo_db = os.getenv("MONGO_DATABASE_NAME")

if os.getenv("ENV") == "production" and all([mongo_username, mongo_password, mongo_cluster, mongo_db]):
    mongo_uri = f"mongodb+srv://{mongo_username}:{mongo_password}@{mongo_cluster}/{mongo_db}?retryWrites=true&w=majority"
else:
    mongo_uri = "mongodb://localhost:27017/linkhub"
mongo = MongoClient(mongo_uri)
db = mongo.get_database("linkhub")

# COLLECTIONS
users_collection = db.get_collection("users")
links_collection = db.get_collection("links")
categories_collection = db.get_collection("categories")
otp_collection = db.get_collection("otps")
bug_report_collection = db.get_collection("bugReport")

db.command("ping")
print("Connected to MongoDB successfully!")
