import re
import jwt
from flask import current_app
from db import db
userCollection = db.get_collection('users')
from bson import ObjectId

def convert_to_slug(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r'\s+', '-', text)
    text = re.sub(r'[^\w\-]+', '', text)
    return text

def validate_and_get_token_payload(token: str) -> bool:
    jwt_secret = current_app.config.get("JWT_SECRET")
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])  
        user = userCollection.find_one({"_id": ObjectId(payload["user_id"])})
        if not user:
            return False, None
        return True, payload
    except jwt.ExpiredSignatureError:
        return False, None
    except jwt.InvalidTokenError:
        return False, None

import secrets

def generate_numeric_otp(length=6):
    # Generates secure random choices from a string of digits
    digits = "0123456789"
    return "".join(secrets.choice(digits) for _ in range(length))