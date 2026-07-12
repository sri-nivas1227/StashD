
from datetime import datetime
from bson import ObjectId
from pymongo.errors import PyMongoError
from db import links_collection


class Link:
    def __init__(self, url, title, description, tags, category_id, user_id, visits=0, _id=None, created_at=None, updated_at=None):
        self._id = ObjectId(_id) if _id else None
        self.url = url
        self.title = title
        self.description = description
        self.tags = tags if isinstance(tags, list) else []
        self.category_id = category_id
        self.user_id = user_id
        self.visits = visits 
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self):
        """Convert Link object to dictionary"""
        doc = {
            "url": self.url,
            "title": self.title,
            "description": self.description,
            "tags": self.tags,
            "category_id": self.category_id,
            "user_id": self.user_id,
            "visits": self.visits,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
        if self._id:
            doc["_id"] = self._id
        return doc
    
    def to_json(self):
        """Convert Link object to JSON-serializable dictionary"""
        return {
            "_id": str(self._id) if self._id else None,
            "url": self.url,
            "title": self.title,
            "description": self.description,
            "tags": self.tags,
            "category_id": self.category_id,
            "user_id": self.user_id,
            "visits": self.visits,
            "created_at": str(self.created_at),
            "updated_at": str(self.updated_at)
        }
    
    def create(self):
        """Create a new link"""
        try:
            self.created_at = datetime.now()
            self.updated_at = None
            link_data = self.to_dict()
            # Remove _id for creation
            if "_id" in link_data:
                del link_data["_id"]
            result = links_collection.insert_one(link_data)
            self._id = result.inserted_id
            return str(result.inserted_id)
        except PyMongoError as e:
            raise Exception(f"Failed to create link: {str(e)}")

    def update(self, updates):
        """Update an existing link"""
        if not self._id:
            raise ValueError("Cannot update link without _id")
        
        try:
            self.updated_at = datetime.now()
            update_data = {k: v for k, v in updates.items() if v is not None}
            update_data['updated_at'] = self.updated_at
            
            # Update object attributes
            for key, value in update_data.items():
                if hasattr(self, key):
                    setattr(self, key, value)
            
            result = links_collection.update_one({"_id": self._id}, {"$set": update_data})
            return result.modified_count > 0
        except PyMongoError as e:
            raise Exception(f"Failed to update link: {str(e)}")
    
    def delete(self):
        """Delete the link"""
        if not self._id:
            raise ValueError("Cannot delete link without _id")
        
        try:
            result = links_collection.delete_one({"_id": self._id})
            return result.deleted_count > 0
        except PyMongoError as e:
            raise Exception(f"Failed to delete link: {str(e)}")
    
    @staticmethod
    def get_by_id(link_id, user_id):
        """Get a link by its ID"""
        try:
            # Convert string ID to ObjectId if necessary
            if isinstance(link_id, str):
                link_id = ObjectId(link_id)
            link_data = links_collection.find_one({"_id": ObjectId(link_id), "user_id":user_id})
            if link_data:
                return Link(**link_data)
            return None
        except (PyMongoError, Exception) as e:
            raise Exception(f"Failed to get link by id: {str(e)}")
    
    @staticmethod
    def get_all():
        """Get all links"""
        try:
            links_data = links_collection.find()
            return [Link(**link_data) for link_data in links_data]
        except PyMongoError as e:
            raise Exception(f"Failed to get all links: {str(e)}")
    
    @staticmethod
    def get_by_user_id(user_id):
        """Get all links for a specific user"""
        try:
            links_data = links_collection.find({"user_id": user_id})
            return [Link(**link_data) for link_data in links_data]
        except PyMongoError as e:
            raise Exception(f"Failed to get links by user_id: {str(e)}")
    
    @staticmethod
    def get_by_category(category_id):
        """Get all links for a specific category"""
        try:
            links_data = links_collection.find({"category_id": category_id})
            return [Link(**link_data) for link_data in links_data]
        except PyMongoError as e:
            raise Exception(f"Failed to get links by category: {str(e)}")
    @staticmethod
    def get_by_url(url):
        """Get a link by its URL"""
        try:
            link_data = links_collection.find_one({"url": url})
            if link_data:
                return Link(**link_data)
            return None
        except PyMongoError as e:
            raise Exception(f"Failed to get link by URL: {str(e)}")

    @staticmethod
    def search_by_tags(tags):
        """Search links by tags"""
        try:
            if isinstance(tags, str):
                tags = [tags]
            links_data = links_collection.find({"tags": {"$in": tags}})
            return [Link(**link_data) for link_data in links_data]
        except PyMongoError as e:
            raise Exception(f"Failed to search links by tags: {str(e)}")
    @staticmethod
    def find_by_searchTerm(searchTerm, user_id):
        """Search links by title or description"""
        try:
            links_data = links_collection.find({
                "$or": [
                    {"title": {"$regex": searchTerm, "$options": "i"}},
                    {"description": {"$regex": searchTerm, "$options": "i"}},
                    {"url": {"$regex": searchTerm, "$options": "i"}}
                ], "user_id": str(user_id)
            }).sort("created_at", -1)
            return [Link(**link_data) for link_data in links_data]
        except PyMongoError as e:
            raise Exception(f"Failed to search links by search term: {str(e)}")
    @staticmethod
    def find_by_searchTerm_in_category(searchTerm, category_id):
        """Search links in a collection matching the searchTerm"""
        try:
            links_data = links_collection.find({
                "$or": [
                    {"title": {"$regex": searchTerm, "$options": "i"}},
                    {"description": {"$regex": searchTerm, "$options": "i"}},
                    {"url": {"$regex": searchTerm, "$options": "i"}}
                ], "category_id": str(category_id)
            }).sort("created_at", -1)
            return [Link(**link_data) for link_data in links_data]
        except PyMongoError as e:
            raise Exception(f"Failed to search links by search term: {str(e)}")

    @staticmethod
    def increment_visits(link_id):
        """Increment the visit count for a link"""
        try:
            if isinstance(link_id, str):
                link_id = ObjectId(link_id)
            
            result = links_collection.update_one(
                {"_id": link_id},
                {"$inc": {"visits": 1}}
            )
            return result.modified_count > 0
        except PyMongoError as e:
            raise Exception(f"Failed to increment visits: {str(e)}")
    
    @staticmethod
    def get_top_by_category(category_id, user_id,limit=5):
        """Get top links by category based on visits"""
        # try:
        # if isinstance(category_id, str):
        #     category_id = ObjectId(category_id)
        
        links_data = links_collection.find({"category_id": category_id, "user_id":str(user_id)}).limit(limit)
        
        return [Link(**link_data) for link_data in links_data]
        # except PyMongoError as e:
        #     raise Exception(f"Failed to get top links by category: {str(e)}")

    def __str__(self):
        return f"Link(id={self._id}, title={self.title}, url={self.url}, visits={self.visits})"

    def __repr__(self):
        return self.__str__()
