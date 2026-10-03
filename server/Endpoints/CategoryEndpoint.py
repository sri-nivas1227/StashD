from flask import Blueprint, jsonify, request
from bson import ObjectId
from models.Category import Category
from models.User import User
import datetime
from helpers.utilities import validate_and_get_token_payload, convert_to_slug
from helpers.validators import validate_category_name, validate_is_public

# Create a Blueprint for Category endpoints
categoryRouter = Blueprint('category', __name__)

@categoryRouter.route('/categories', methods=['GET'])
def get_categories():
    # get token from cookies
    token = request.cookies.get('token')
    is_valid_token, payload = validate_and_get_token_payload(token) if token else False
    if is_valid_token:
        user_id = payload.get('user_id')
    else:
        return jsonify({
            "success": False,
            "message": "Invalid or missing token"
        }), 401
    categories = Category.get_categories_by_user_id(user_id)
    return jsonify({
        "success": True,
        "message": "List of categories",
        "data": categories
    }), 200

@categoryRouter.route('/categories/<category_id>', methods=['PUT'])
def update_category(category_id):
    # get token from cookies
    token = request.cookies.get('token')
    is_valid_token, payload = validate_and_get_token_payload(token) if token else False
    if is_valid_token:
        user_id = payload.get('user_id')
    else:
        return jsonify({
            "success": False,
            "message": "Invalid or missing token"
        }), 401
    
    data = request.get_json()
    # category_id = data.get('category_id')
    new_name = data.get('name')
    # new_slug = data.get('new_slug')
    is_public = data.get('isPublic')
    if not category_id and not new_name:
        return jsonify({
            "success": False,
            "message": "a name or is_public is required"
        }), 400

    if new_name is not None:
        is_valid, error = validate_category_name(new_name)
        if not is_valid:
            return jsonify({"success": False, "message": error}), 400

    if is_public is not None:
        is_valid, error = validate_is_public(is_public)
        if not is_valid:
            return jsonify({"success": False, "message": error}), 400

    category = Category.get_by_id(category_id=category_id, user_id=user_id)
    if new_name:
        new_slug = convert_to_slug(new_name)
        if category.category_slug != new_slug:
            category.category_slug = new_slug
        if category.name != new_name:
            category.name = new_name
    if is_public is not None and category.is_public != is_public:
        category.is_public = is_public
    category.update()
    if category:
        return jsonify({
            "success": True,
            "message": "Category updated successfully",
            "data": category.to_json()
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": "Category not found or you don't have permission to update it"
        }), 404

@categoryRouter.route('/categories/<category_id>', methods=['GET'])
def get_category(category_id):
    # get token from cookies
    token = request.cookies.get('token')
    is_valid_token, payload = validate_and_get_token_payload(token) if token else False
    if is_valid_token:
        user_id = payload.get('user_id')
    else:
        return jsonify({
            "success": False,
            "message": "Invalid or missing token"
        }), 401
    
    category = Category.get_by_id(category_id=category_id, user_id=user_id)
    if category:
        return jsonify({
            "success": True,
            "message": "Category details",
            "data": category.to_json()
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": "Category not found or you don't have permission to view it"
        }), 404

@categoryRouter.route('/categories/generate_public_url/<category_id>', methods=['GET'])
def generate_collection_public_url(category_id:str):
    # get token from cookies
    token = request.cookies.get('token')
    is_valid_token, payload = validate_and_get_token_payload(token) if token else False
    if is_valid_token:
        user_id = payload.get('user_id')
    else:
        return jsonify({
            "success": False,
            "message": "Invalid or missing token"
        }), 401
    
    category = Category.get_by_id(category_id=category_id, user_id=user_id)
    user = User.get_by_id(user_id=user_id)
    if user and category.is_public:
        return jsonify({
            "success": True,
            "message": "Category details",
            "data": {
                "public_url": f"{user.username}/{category.category_slug}"
            }
        }), 200 
    else:
         return jsonify({
            "success": False,
            "message": "Failed to fetch Public URL"
        }), 401
