from datetime import datetime
from bson import ObjectId
from pymongo.errors import PyMongoError
from db import db

CategoriesCollection = db['categories']


class Category:
    def __init__(self, name, category_slug, user_id, created_at=None, is_public=False, updated_at=None, _id=None):
        self._id = ObjectId(_id) if _id else None
        self.name = name
        self.category_slug = category_slug
        self.is_public = is_public  
        self.user_id = user_id
        self.created_at = created_at
        self.updated_at = updated_at
    
    def to_dict(self):
        """Convert Category object to dictionary"""
        doc = {
            "name": self.name,
            "category_slug": self.category_slug,
            "user_id": self.user_id,
            "is_public": self.is_public,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
        if self._id:
            doc["_id"] = self._id
        return doc
    
    def to_json(self):
        """Convert Category object to JSON-serializable dictionary"""
        return {
            "_id": str(self._id) if self._id else None,
            "name": self.name,
            "category_slug": self.category_slug,
            "user_id": self.user_id,
            "is_public": self.is_public,
            "created_at": str(self.created_at) if self.created_at else None,
            "updated_at": str(self.updated_at) if self.updated_at else None
        }

    def create(self):
        """Create a new category"""
        try:
            self.created_at = datetime.now()
            self.updated_at = self.created_at
            category_data = self.to_dict()
            result = CategoriesCollection.insert_one(category_data)
            self._id = result.inserted_id
            return self
        except PyMongoError as e:
            raise Exception(f"Error creating category: {str(e)}")
    
    def update(self):
        """Update an existing category"""
        if not self._id:
            raise Exception("Category ID is required for update")
        try:
            self.updated_at = datetime.now()
            category_data = self.to_dict()
            CategoriesCollection.update_one({"_id": self._id}, {"$set": category_data})
            return self
        except PyMongoError as e:
            raise Exception(f"Error updating category: {str(e)}")
    @staticmethod
    def get_all_by_user_id(user_id):
        try:
            categories = CategoriesCollection.find({"user_id":user_id})
            categories = [Category(**cat) for cat in categories]
            return categories
        except PyMongoError as e:
            raise Exception(f"Error fetching categories: {str(e)}")
    @staticmethod
    def get_all_public_by_user_id(user_id):
        try:
            categories = CategoriesCollection.find({"user_id":user_id, "is_public":True})
            categories = [Category(**cat) for cat in categories]
            return categories
        except PyMongoError as e:
            raise Exception(f"Error fetching categories: {str(e)}")
        
    @staticmethod
    def get_by_id(category_id, user_id):
        try:
            category = CategoriesCollection.find_one({"_id": ObjectId(category_id), "user_id": user_id})
            if category:
                return Category(**category)
            return None
        except PyMongoError as e:
            raise Exception(f"Error fetching category by ID: {str(e)}")
    
    @staticmethod
    def get_categories_by_user_id(user_id):
        try:
            categories = CategoriesCollection.find({"user_id": user_id})
            return [{"id": str(cat["_id"]), "name": cat["name"], "is_public": cat["is_public"]} for cat in categories]
        except PyMongoError as e:
            raise Exception(f"Error fetching category names by user ID: {str(e)}")
    
    @staticmethod
    def get_by_slug(category_slug:str, user_id:str):
        try:
            category = CategoriesCollection.find_one({"category_slug": category_slug, "user_id":user_id})
            if category:
                return Category(**category)
            return None
        except PyMongoError as e:
            raise Exception(f"Error fetching category by slug: {str(e)}")