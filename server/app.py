from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from Endpoints.UrlEndpoint import urlRouter
from Endpoints.CategoryEndpoint import categoryRouter
from Endpoints.AuthEndpoints import auth_router
from Endpoints.ProfileEndpoints import profile_router
from Endpoints.ShareEndpoints import share_router
from Endpoints.AdminEndpoints import admin_router
from flask_cors import CORS
from db import db, ping_db
import logging

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)

# Verify DB connectivity at startup (also runs under gunicorn, not just __main__)
if ping_db():
    logger.info("MongoDB connection successful (database: %s)", db.name)
else:
    logger.error("MongoDB connection FAILED - check MONGO_URI / credentials / network")

# Initialize Flask app
app = Flask(__name__)
app.config.from_object('config.Config')
CORS(app, origins=os.getenv("ALLOWED_HOSTS"))
app.register_blueprint(auth_router)
app.register_blueprint(urlRouter)
app.register_blueprint(categoryRouter)
app.register_blueprint(profile_router)
app.register_blueprint(share_router)
app.register_blueprint(admin_router)
# Helper function to serialize MongoDB documents
def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable format"""
    if doc:
        doc['_id'] = str(doc['_id'])
    return doc

# Routes
@app.get('/')
def home():
    """Home route"""
    return jsonify({
        "message": "Welcome to LinkHub API",
        "status": "running",
        "database": "connected" if ping_db() else "disconnected"
    })


# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Run the app
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f"Starting LinkHub server on port {port}")    
    app.run(host='0.0.0.0', port=port, debug=debug)