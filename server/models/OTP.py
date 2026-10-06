import secrets
from bson import ObjectId
from db import otp_collection
from datetime import datetime, timedelta
class OTP:
    def __init__(self, _id=None, otp=None, user_id=None, created_at=None, expires_at=None, active=None, verified=None, purpose=None, attempts=0):
        self._id = ObjectId(_id) if _id else None
        self.otp = otp
        self.user_id = ObjectId(user_id)
        self.created_at = created_at
        self.expires_at = expires_at
        self.active = active
        self.verified = verified
        self.purpose = purpose
        self.attempts = attempts
    
    def to_dict(self):
        return {
            "_id": self._id,
            "otp": self.otp,
            "user_id": self.user_id,
            "created_at": self.created_at,
            "expires_at": self.expires_at,
            "active": self.active,
            "verified": self.verified,
            "purpose": self.purpose,
            "attempts": self.attempts
        }
    
    def to_json(self):
        pass

    def create(self):
        try:
            otp_data = self.to_dict()
            if otp_data.get("_id") is None:
                del otp_data["_id"]
            result = otp_collection.insert_one(otp_data)
            self._id = result.inserted_id
            return str(result.inserted_id)
        except Exception as e:
            raise Exception(f"Failed to create OTP: {str(e)}")
    
    def update(self, updates):
        """Update an existing OTP"""
        if not self._id:
            raise ValueError("Cannot update OTP without _id")
        
        try:
            update_data = {k: v for k, v in updates.items() if v is not None}
            
            # Update object attributes
            for key, value in update_data.items():
                if hasattr(self, key):
                    setattr(self, key, value)
            
            result = otp_collection.update_one({"_id": self._id}, {"$set": update_data})
            return result.modified_count > 0
        except Exception as e:
            raise Exception(f"Failed to update OTP: {str(e)}")
    
    def delete(self):
        """Delete the OTP"""
        if not self._id:
            raise ValueError("Cannot delete OTP without _id")
        
        try:
            
            result = otp_collection.delete_one({"_id": self._id})
            return result.deleted_count > 0
        except Exception as e:
            raise Exception(f"Failed to delete otp: {str(e)}")
    @staticmethod
    def build_otp_object(otp, user_id, purpose=None):
        OTP_expiry_duration = 3
        return OTP(otp=otp, user_id=user_id, created_at=datetime.now(), expires_at=datetime.now()+timedelta(minutes=OTP_expiry_duration),active=True,verified=False,purpose=purpose)
    
    @staticmethod
    def get_otp_by_id(_id):
        otp = otp_collection.find_one(filter={"_id":ObjectId(_id)})
        if otp:
            return OTP(**otp)
        return None
    @staticmethod
    def verify_otp(otp, otp_id):
        otp_object = otp_collection.find_one(filter={"_id":ObjectId(otp_id), "active":True})
        if otp_object.get("otp") == otp:
            if otp_object.get("expires_at") >=datetime.now():
                otp_object["verified"] = True
                otp_object["active"] = False
                otp_collection.update_one(filter={"_id":ObjectId(otp_id)},update={"$set":otp_object})
                return True
        return False

    @staticmethod
    def verify_otp_for_purpose(otp, otp_id, user_id, purpose, max_attempts=5):
        """Verify an OTP bound to a user and purpose. Burns the OTP after too many wrong guesses."""
        try:
            query = {"_id": ObjectId(otp_id), "user_id": ObjectId(user_id), "purpose": purpose, "active": True}
        except Exception:
            return False
        otp_object = otp_collection.find_one(filter=query)
        if not otp_object or not isinstance(otp, str):
            return False
        if otp_object.get("attempts", 0) >= max_attempts or otp_object.get("expires_at") < datetime.now():
            otp_collection.update_one({"_id": otp_object["_id"]}, {"$set": {"active": False}})
            return False
        if not secrets.compare_digest(str(otp_object.get("otp")), otp):
            otp_collection.update_one({"_id": otp_object["_id"]}, {"$inc": {"attempts": 1}})
            return False
        otp_collection.update_one({"_id": otp_object["_id"]}, {"$set": {"active": False, "verified": True}})
        return True

    @staticmethod
    def inactivate_otp(otp_id):
        update_data = {
            "active":False,
            "verified":False
        }
        otp_collection.update_one(filter={"_id":ObjectId(otp_id)},update={"$set":update_data})
        return True




