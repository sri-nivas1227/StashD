
from flask import current_app
import resend
from helpers.utilities import generate_numeric_otp
from helpers.Email_Templates import get_login_email_template, get_registration_email_template


def send_email(fromEmail:str, toEmails:list[str], subject:str,bodyType:str, body:str, attachments=None):
    resend.api_key = current_app.config.get("RESEND_API_KEY")
    params: resend.Emails.SendParams = {
        "from": fromEmail,
        "to": toEmails,
        "subject": subject,
    }
    if bodyType == "text":
        params["text"] = body
    if bodyType == "html":
        params["html"] = body
    if attachments:
        params["attachments"] = attachments
    try:
        email = resend.Emails.send(params=params)
    except Exception as e :
        return {"error": f"Send Email Failed. Error: {e}"}
    
    return email

def send_onboarding_otp(toEmail:str):
    random_OTP = generate_numeric_otp()

    # Email Params
    fromEmail = f"StashD <onboarding@{current_app.config.get('RESEND_EMAIL_DOMAIN')}>"
    toEmails = [toEmail]
    subject = f"{random_OTP} is your StashD verification code"
    bodyType = "html"
    body = get_registration_email_template(otp=random_OTP)
    email_data = send_email(fromEmail=fromEmail, toEmails=toEmails, subject=subject, bodyType=bodyType, body=body)
    return {
            "otp": random_OTP,
            "email_data": email_data
        }

def send_login_otp(toEmail: str):
    random_OTP = generate_numeric_otp()

    # Email Params
    fromEmail = f"StashD <verify@{current_app.config.get('RESEND_EMAIL_DOMAIN')}>"
    toEmails = [toEmail]
    subject = f"{random_OTP} is your StashD login code"
    bodyType = "html"
    body = get_login_email_template(otp=random_OTP)
    email_data = send_email(fromEmail=fromEmail, toEmails=toEmails, subject=subject, bodyType=bodyType, body=body)
    return {
            "otp": random_OTP,
            "email_data": email_data
        }
    