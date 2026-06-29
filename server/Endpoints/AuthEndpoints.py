from flask import request, Blueprint, make_response, current_app
from bcrypt import hashpw, gensalt, checkpw
import jwt
from dotenv import load_dotenv
import os
from datetime import datetime
from helpers.utilities import validate_and_get_token_payload
from models.User import User
from models.OTP import OTP
from helpers.resend_emailer import send_onboarding_otp, send_login_otp
load_dotenv()
auth_router = Blueprint("auth", __name__)


@auth_router.route("/signup", methods=["POST"])
def signup():
    # Handle signup logic here
    data = request.get_json()
    full_name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    # Check if user already exists
    existing_user = User.get_by_email(email)
    if existing_user:
        return make_response({"success": False, "message": "An account with this email already exists"}, 400)
    if not full_name or not email or not password:
        return make_response(
            {"success": False, "message": "All fields are required"}, 400
        )
    user = User(
        email=email,
        full_name=full_name,
        password=hashpw(password.encode("utf-8"), gensalt()).decode("utf-8"),
    )
    user_id = user.create()
    if user_id:
        # Trigger Verification Email with OTP
        email_verification_data = send_onboarding_otp(email,)
        otp_data = OTP.build_otp_object(otp=email_verification_data.get("otp"), user_id=user_id)
        otp_inserted_id = otp_data.create()
        jwt_secret = current_app.config.get("JWT_SECRET")
        jwt_token = jwt.encode(
            {
                "user_id": str(user._id),
                "otp_id": otp_inserted_id,
                "datetime": str(datetime.now()),
            },
            jwt_secret,
            algorithm="HS256",
        )
        response = make_response(
            {"success": True, "message": "User registered and OTP sent successfully to the Email!", "data":{"otp_id":otp_inserted_id}}, 201
        )
        response.set_cookie("X-OTPVerifier",jwt_token, max_age=5000, httponly=True, samesite="None", secure=True )
        return response

@auth_router.route("/signup/verify_username", methods=["POST"])
def verify_username():
    data = request.get_json()
    username = data.get("username")
    username_exists = User.is_username_exists(username)
    print(username_exists)
    if username_exists:
        return make_response(
            {"success": False, "message": "Username already exists."}, 400
        )
    else:
        return make_response(
            {"success":True, "message":"Username available."}, 200
        )

@auth_router.route("/auth/resend_otp", methods=["POST"])
def resend_otp():
    data = request.get_json()
    user_id = data.get("user_id")
    otp_id = data.get("otp_id")

    # Inactivate previous OTP first
    is_otp_inactive = OTP.inactivate_otp(otp_id)
    if user_id and is_otp_inactive:
        user = User.get_by_id(user_id=user_id)
        email_verification_data = send_onboarding_otp(user.email)
        otp_data = OTP.build_otp_object(otp=email_verification_data.get("otp"), user_id=user_id)
        otp_inserted_id = otp_data.create()
        jwt_secret = current_app.config.get("JWT_SECRET")
        jwt_token = jwt.encode(
            {
                "user_id": str(user._id),
                "otp_id": otp_inserted_id,
                "datetime": str(datetime.now()),
            },
            jwt_secret,
            algorithm="HS256",
        )
        response = make_response(
            {"success": True, "message": "OTP sent successfully to the Email!"}, 201
        )
        response.set_cookie("X-OTPVerifier",jwt_token, max_age=5000, httponly=True, samesite="None", secure=True )
        return response
    
@auth_router.route("/auth/verify_otp", methods=["POST"])
def verify_OTP():
    data = request.get_json()
    user_OTP = data.get("otp")
    user_id = data.get("user_id")
    otp_id = data.get("otp_id")
    is_otp_verified = OTP.verify_otp(user_OTP, otp_id)
    if not is_otp_verified:
        return make_response(
            {
                "success": False,
                "message": "OTP not verified. Try again!",
            },
            400,
        )
    
    # update user with email verified
    verify_email_confirmation = User.verify_user_email(user_id)
    if verify_email_confirmation:
        user = User.get_by_id(user_id)
        jwt_secret = current_app.config.get("JWT_SECRET")
        jwt_token = jwt.encode(
            {
                "user_id": str(user._id),
                "name": user.full_name,
                "datetime": str(datetime.now()),
            },
            jwt_secret,
            algorithm="HS256",
        )
        # write jwt token to the cookies

        return make_response(
            {
                "success": True,
                "message": "Login successful",
                "data": {"token": jwt_token},
            },
            200,
        )
    else:
        return make_response(
            {
                "success": False,
                "message": "OTP not verified. Try again!"
            },400
        )

@auth_router.route("/login", methods=["POST"])
def login():
    # Handle login logic here
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    is_otp_login = data.get("otp")
    user = User.get_by_email(email)
    if not user:
        return make_response(
            {
                "success": False,
                "message": "User not found",
                "data": {"redirect": "/auth/signup"},
            },
            401,
        )
    if is_otp_login or not user.email_verified:

        email_data = send_onboarding_otp(email) if not is_otp_login else send_login_otp(email)
        otp_data = OTP.build_otp_object(otp=email_data.get("otp"), user_id=str(user._id))
        otp_inserted_id = otp_data.create()
        jwt_secret = current_app.config.get("JWT_SECRET")
        jwt_token = jwt.encode(
            {
                "user_id": str(user._id),
                "otp_id": otp_inserted_id,
                "datetime": str(datetime.now()),
            },
            jwt_secret,
            algorithm="HS256",
        )
        response = make_response(
            {
                "success": False if not is_otp_login else True,
                "message": "Please verify your email before Logging in." if not is_otp_login else "An OTP has been sent to your email.",
                "data": {
                    "redirect": "/auth/verifyEmail"
                }
            }
        )
        response.set_cookie("X-OTPVerifier",jwt_token, max_age=5000, httponly=True, samesite="None", secure=True )
        return response
    if checkpw(
        password.encode("utf-8"), user.password.encode("utf-8")
    ):
        jwt_secret = current_app.config.get("JWT_SECRET")
        jwt_token = jwt.encode(
            {
                "user_id": str(user._id),
                "name": user.full_name,
                "datetime": str(datetime.now()),
            },
            jwt_secret,
            algorithm="HS256",
        )
        # write jwt token to the cookies

        response = make_response(
            {
                "success": True,
                "message": "Login successful",
                "data": {
                    "redirect": "/home"
                },
            },
            200,
        )
        response.set_cookie("auth_token",jwt_token, httponly=True, secure=True )
        return response

    return make_response(
        {"success": False, "message": "Invalid email or password"}, 401
    )

@auth_router.route("/auth/update_password", methods=["PUT"])
def update_password():
    token = request.cookies.get("token")
    is_valid_token, payload = validate_and_get_token_payload(token) if token else False
    if not is_valid_token:
        return make_response({"success": False, "message": "Invalid or missing token"}, 401)

    user_id = payload.get("user_id")
    user = User.get_by_id(user_id)
    if not user:
        return make_response({"success":False, "message":"User does not exist"}, 401)

    data = request.get_json()
    currentPassword = data.get("currentPassword")
    newPassword = data.get("newPassword")
    if checkpw(
        currentPassword.encode("utf-8"), user.password.encode("utf-8")
    ):
        is_user_updated = user.update({  "password": hashpw(newPassword.encode("utf-8"), gensalt()).decode("utf-8")})
        if is_user_updated:
            return make_response({
                "success": True,
                "message": "Password has been successfully updated. Please login with your new password!"
            }, 200)
    return make_response({
        "success": False,
        "message": "Something went wrong! Please try again."
    })
        
    


@auth_router.route("/ping", methods=["GET"])
def ping():
    token = request.cookies.get("token")
    token = request.cookies.get('token')
    is_valid_token, payload = validate_and_get_token_payload(token) if token else False
    if is_valid_token:
        user_id = payload.get('user_id')
        user = User.get_by_id(user_id)
        if user:
            return make_response({"success":True, "message": f"pong, {user.full_name}"}, 200)
    return make_response({
            "success": False,
            "message": "Invalid or missing token"
        }, 401)
