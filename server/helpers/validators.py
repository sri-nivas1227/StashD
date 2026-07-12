import re

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
USERNAME_REGEX = re.compile(r"^[a-zA-Z][a-zA-Z0-9_]{2,19}$")
FULL_NAME_REGEX = re.compile(r"^[a-zA-Z][a-zA-Z\s'-]{1,49}$")
PASSWORD_REGEX = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=?.,;:-])"
    r"[A-Za-z\d!@#$%^&*()_+=?.,;:-]{8,}$"
)


def validate_email(email: str):
    if not isinstance(email, str) or not EMAIL_REGEX.match(email.strip()):
        return False, "Invalid email format"
    return True, None


def validate_password(password: str):
    if not isinstance(password, str) or not PASSWORD_REGEX.match(password):
        return False, (
            "Password must be at least 8 characters and include an uppercase "
            "letter, a lowercase letter, a digit, and a special character"
        )
    return True, None


def validate_full_name(full_name: str):
    if not isinstance(full_name, str) or not FULL_NAME_REGEX.match(full_name.strip()):
        return False, "Full name must be 2-50 characters and contain only letters, spaces, hyphens, or apostrophes"
    return True, None


def validate_username(username: str):
    if not isinstance(username, str) or not USERNAME_REGEX.match(username.strip()):
        return False, (
            "Username must be 3-20 characters, start with a letter, and contain "
            "only letters, numbers, or underscores"
        )
    return True, None
