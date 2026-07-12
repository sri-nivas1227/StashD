from flask import Blueprint, request, jsonify, make_response
from helpers.utilities import (
    validate_and_get_token_payload
)
from helpers.validators import validate_email, validate_full_name
from db import users_collection
from bson import ObjectId
from models.User import User
from models.Category import Category

profile_router = Blueprint("profile", __name__)


@profile_router.route("/profile", methods=["POST"])
def update_profile():
    token = request.cookies.get("token")
    is_valid_token, payload = validate_and_get_token_payload(token) if token else False
    if not is_valid_token:
        return make_response({"success": False, "message": "Invalid or missing token"}, 401)
    data = request.get_json()
    name  = data.get("name")
    description = data.get("description")
    profile_links = data.get("links")
    email = data.get("email")
    if not name or not description or not profile_links or not email:
        return make_response({"success": False, "message": "Missing required fields"}, 400)

    is_valid, error = validate_full_name(name)
    if not is_valid:
        return make_response({"success": False, "message": error}, 400)

    is_valid, error = validate_email(email)
    if not is_valid:
        return make_response({"success": False, "message": error}, 400)

    user_id = payload.get("user_id")
    user = User.get_by_id(user_id)
    if not user:
        return make_response({"success": False, "message": "User not found"}, 404)
    user.full_name = name
    user.email = email
    user.profile['description'] = description
    user.profile['links'] = profile_links
    user.update(user.to_dict())
    return make_response({"success":True, "message":"Profile Updated Successfully"}, 200)


@profile_router.route("/profile", methods=["GET"])
def getProfile():
    token = request.cookies.get("token")
    is_valid_token, payload = validate_and_get_token_payload(token) if token else False
    if not is_valid_token:
        return make_response({"success": False, "message": "Invalid or missing token"}, 401)

    user_id = payload.get("user_id")
    user = User.get_by_id(user_id)
    if not user:
        return make_response({"success":False, "message":"User does not exist"}, 401)

    profile_data = user.profile if user.profile else {}
    
    response_data = {
        "name": user.full_name,
        "username": user.username,
        "email": user.email,
        "description": profile_data.get("description", ""),
        "links": profile_data.get("links", []),
    }
    return make_response(
            {
                "success": True,
                "message":"Profile fetched successfully",
                "data":{"profile": response_data}
            },200
        )


@profile_router.route("/profile/<username>", methods=["GET"])
def get_public_profile(username: str):
    user = User.get_by_username(username)
    if not user:
        return make_response({"success": False, "message": "User not found"}, 404)

    all_public_categories = Category.get_all_public_by_user_id(str(user._id))
    public_collections = [
        {"name": cat.name, "slug": cat.category_slug}
        for cat in all_public_categories
    ]

    profile_data = user.profile if user.profile else {}
    return make_response(
        {
            "success": True,
            "message": "Public profile fetched successfully",
            "data": {
                "name": user.full_name,
                "username": user.username,
                "description": profile_data.get("description", ""),
                "links": profile_data.get("links", []),
                "public_collections": public_collections,
            }
        },
        200
    )
