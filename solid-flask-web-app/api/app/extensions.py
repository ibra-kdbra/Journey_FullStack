from flask import request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_login import LoginManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_restx import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase


class ModelBase(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=ModelBase)
api = Api()
login_manager = LoginManager()
migrate = Migrate()
mail = Mail()


def account_key() -> str:
    """Rate-limit key for per-account limits: the email in the JSON body.

    Falls back to the client address when the body has no usable email, so the
    limit still applies to malformed requests.
    """
    body = request.get_json(silent=True)
    email = body.get("email") if isinstance(body, dict) else None
    if isinstance(email, str) and email:
        return f"account:{email.strip().lower()}"
    return f"ip:{get_remote_address()}"


# Storage and enablement come from the app config (RATELIMIT_* keys).
limiter = Limiter(key_func=get_remote_address)
