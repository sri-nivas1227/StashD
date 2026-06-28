from flask import Blueprint, jsonify, request
from pymongo import DESCENDING, ASCENDING
from bson import ObjectId
from models.Link import Link
from db import db
from helpers.utilities import convert_to_slug
from models.Category import Category
from helpers.utilities import validate_and_get_token_payload


# Create a Blueprint for URL endpoints
urlRouter = Blueprint('url', __name__)


@urlRouter.route('/urls', methods=['POST'])
def create_url():
    """Create a new URL"""
    # try:
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
    # Validate required fields
    if not data or not data.get('url'):
        return jsonify({"message": "URL is required"}), 400
    if not data.get('category_id') and not data.get("new_category"):
        return jsonify({"message": "Category ID is required"}), 400
    if not data.get("category_id") and data.get("new_category"):
        # check if the new_category already exists
        new_category_slug = convert_to_slug(data.get("new_category"))
        existing_category = Category.get_by_slug(new_category_slug, user_id)
        if existing_category:
            # Use existing category ID
            data['category_id'] = str(existing_category._id)
        else:
            # Create new category if not provided
            new_category = data.get("new_category")
            new_category_slug = convert_to_slug(new_category)
            new_category_object = Category(name=new_category, category_slug=new_category_slug, user_id=user_id)
            new_category_object.create()
            data['category_id'] = str(new_category_object._id)
    
    # Check if the URL already exists
    existing_link = Link.get_by_url(data.get("url"))
    if existing_link:
        existing_link = existing_link.to_dict()
        # Fetch category details for the existing link
        if existing_link.get("category"):
            category = Category.get_by_id(existing_link['category_id'], user_id=user_id)
            if category:
                return jsonify({"success":False,"message": f"URL already exists in category {category.name}"}), 409
        return jsonify({"success":False,"message": f"URL already exists in {existing_link['_id']}"}, 409)
    
    # Create new Link object
    link = Link(
        url=data.get('url'),
        title=data.get('title', ''),
        description=data.get('description', ''),
        tags=data.get('tags', []),
        category_id=data.get('category_id'),
        user_id=user_id
    )
    
    # Save to database
    link_id = link.create()
    
    return jsonify({
        "success": True,
        "message": "URL created successfully",
        "data":{
        "_id": link_id,
        "link": link.to_json()
        } 
    }), 201
    
    # except Exception as e:
    #     return jsonify({"error": str(e)}), 500

@urlRouter.route('/urls/user', methods=['GET'])
def get_urls_by_user():
    """Get all URLs for a specific user"""
    token = request.cookies.get('token')
    is_valid_token, payload = validate_and_get_token_payload(token) if token else False
    if is_valid_token:
        user_id = payload.get('user_id')
    else:
        return jsonify({
            "success": False,
            "message": "Invalid or missing token"
        }), 401
    try:
        links = Link.get_by_user_id(user_id)
        links_data = [link.to_json() for link in links]
        return jsonify({
            "success": True,
            "message": f"URLs for user {user_id}",
            "data": {"links":links_data}
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@urlRouter.route('/urls/category', methods=['GET'])
def get_urls_by_category():
    """Get all URLs for a specific category"""
    token = request.cookies.get('token')
    is_valid_token, payload = validate_and_get_token_payload(token) if token else False
    if is_valid_token:
        user_id = payload.get('user_id')
    else:        
        return jsonify({
            "success": False,
            "message": "Invalid or missing token"
        }), 401
    try:
        category_id = request.args.get('category_id')
        if not category_id:
            return jsonify({"message": "Category ID is required"}), 400
        try:
            category = Category.get_by_id(category_id, user_id)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        links = Link.get_by_category(category_id)
        # Remove user_id for privacy
        links_data = []
        for link in links:
            link_json = link.to_json()
            if 'user_id' in link_json:
                del link_json['user_id']
            links_data.append(link_json)
        
        return jsonify({
            "message": f"URLs for category {category_id}",
            "data": {"category":category.name, "links":links_data}
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@urlRouter.route('/urls/search', methods=['GET'])
def search_urls_by_search():
    """Search URLs by tags"""
    token = request.cookies.get('token')
    is_valid_token, payload = validate_and_get_token_payload(token) if token else False
    if is_valid_token:
        user_id = payload.get('user_id')
    else:
        return jsonify({
            "success": False,
            "message": "Invalid or missing token"
        }), 401
    try:
        searchTerm = request.args.get('query')
        if not searchTerm:
            return jsonify({"message": "Search term is required"}), 400
        
        # Convert comma-separated tags to list
        # tags_list = [tag.strip() for tag in tags.split(',')]
        
        links = Link.find_by_searchTerm(searchTerm, user_id)
        # Remove user_id for privacy
        links_data = []
        for link in links:
            link_json = link.to_json()
            if 'user_id' in link_json:
                del link_json['user_id']
            links_data.append(link_json)
        
        return jsonify({
            "success": True,
            "message": f"URLs matching tags: {searchTerm}",
            "data": {"links":links_data}
        }), 200
    except Exception as e:
        return jsonify({"success":False, "message": str(e)}), 

@urlRouter.route('/urls/<url_id>', methods=['GET'])
def get_url_by_id(url_id):
    """Get a specific URL by ID"""
    token = request.cookies.get('token')
    is_valid_token, payload = validate_and_get_token_payload(token) if token else False
    if is_valid_token:
        user_id = payload.get('user_id')
    else:
        return jsonify({
            "success": False,
            "message": "Invalid or missing token"
        }), 401
    try:
        link = Link.get_by_id(url_id, user_id)
        if link and link.user_id == user_id:
            return jsonify({
                "success": True,
                "message": "URL found",
                "data": link.to_json()
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "URL not found or unauthorized access"
            }), 404
    except Exception as e:
        return jsonify({"success":False, "error": str(e)}), 500

@urlRouter.route('/urls/<url_id>', methods=['PUT'])
def update_url(url_id):
    """Update a specific URL by ID"""
    token = request.cookies.get('token')
    is_valid_token, payload = validate_and_get_token_payload(token) if token else False
    if is_valid_token:
        user_id = payload.get('user_id')
    else:
        return jsonify({
            "success": False,
            "message": "Invalid or missing token"
        }), 401
    try:
        link = Link.get_by_id(url_id, user_id)
        if not link or link.user_id != user_id:
            return jsonify({
                "success": False,
                "message": "URL not found or unauthorized access"
            }), 404
        
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data provided"}), 400
        if data.get("category_id"):
            del data["new_category"]
            # Update the link
            success = link.update(data)
        else:
            # Check if the new_category already exists
            new_category = data.get("new_category")
            if new_category:
                new_category_slug = convert_to_slug(new_category)
                existing_category = Category.get_by_slug(new_category_slug, user_id)
                if existing_category:
                    # Use existing category ID
                    data['category_id'] = str(existing_category._id)
                else:
                    # Create new category if not provided
                    new_category_object = Category(name=new_category, category_slug=new_category_slug, user_id=user_id)
                    new_category_object.create()
                    data['category_id'] = str(new_category_object._id)
            del data["new_category"]
            success = link.update(data)
        if success:
            return jsonify({
                "success": True,
                "message": "URL updated successfully",
                "data": link.to_json()
            }), 200
        else:
            return jsonify({"success": False, "message": "Update failed"}), 400
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@urlRouter.route('/urls/<url_id>', methods=['DELETE'])
def delete_url(url_id):
    """Delete a specific URL by ID"""
    token = request.cookies.get('token')
    is_valid_token, payload = validate_and_get_token_payload(token) if token else False
    if is_valid_token:
        user_id = payload.get('user_id')
    else:
        return jsonify({
            "success": False,
            "message": "Invalid or missing token"
        }), 401
    try:
        link = Link.get_by_id(url_id, user_id)
        if not link:
            return jsonify({"success": False, "message": "URL not found"}), 404
        
        success = link.delete()
        if success:
            return jsonify({"success": True, "message": "URL deleted successfully"}), 200
        else:
            return jsonify({"success": False, "message": "Delete failed"}), 400
            
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
