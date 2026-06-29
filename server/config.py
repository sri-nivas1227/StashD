import os 
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS")
    RESEND_EMAIL_DOMAIN = os.getenv("RESEND_EMAIL_DOMAIN")
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
    #
    FILE_UPLOAD_MAX_SIZE = 5 * 1024 * 1024
    FILE_UPLOAD_ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "application/pdf"]
    #
    RESEND_API_KEY = os.getenv("RESEND_API_KEY")
    #
    MONGO_CLUSTER_URL = os.getenv("MONGO_CLUSTER_URL")
    MONGO_DATABASE_NAME= os.getenv("MONGO_DATABASE_NAME")
    MONGO_USERNAME= os.getenv("MONGO_USERNAME")
    MONGO_PASSWORD= os.getenv("MONGO_PASSWORD")
    #
    JWT_SECRET = os.getenv("JWT_SECRET")
