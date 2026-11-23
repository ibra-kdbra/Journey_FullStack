from cryptography.fernet import Fernet
from flask import current_app


def _fernet() -> Fernet:
    return Fernet(current_app.config["FERNET_SECRET_KEY"])


def encrypt(value: str):
    return _fernet().encrypt(value.encode()).decode()


def decrypt(value: str):
    return _fernet().decrypt(value.encode()).decode()
