import os
from urllib.parse import quote_plus

MY_SOLID_APP_PASSWORD_RESET_TOKEN_EXPIRE_HOURS = int(
    os.environ.get("MY_SOLID_APP_PASSWORD_RESET_TOKEN_EXPIRE_HOURS", "1")
)
MY_SOLID_APP_FRONTEND_URL = os.environ.get(
    "MY_SOLID_APP_FRONTEND_URL", "http://localhost:5173"
)
MY_SOLID_APP_REDIS_HOST = os.environ.get("MY_SOLID_APP_REDIS_HOST", "localhost")

# Publicly known, development-only values. They are used by DevConfig and
# TestConfig and are never reachable from ProdConfig, which refuses to start
# when a secret is missing or still set to one of them.
DEV_SECRET_KEY = "dev-only-insecure-secret-key"
DEV_FERNET_SECRET_KEY = "kxmkv6vw7AMDx92BH9JSEZ7_PQqPyYsWZBAGzP0kXys="
DEV_DB_PASSWORD = "my_solid_app_password"
DEV_MAIL_PASSWORD = "12345678"


class ConfigurationError(RuntimeError):
    """Raised when the configuration is unsafe or incomplete."""


class BaseConfig:
    """Shared settings. Secrets are resolved by `_secret`, which subclasses tune."""

    # None means the variable is required and has no fallback.
    _SECRET_DEFAULTS: dict[str, str | None] = {
        "SECRET_KEY": DEV_SECRET_KEY,
        "FERNET_SECRET_KEY": DEV_FERNET_SECRET_KEY,
        "DB_PASSWORD": DEV_DB_PASSWORD,
        "MAIL_PASSWORD": DEV_MAIL_PASSWORD,
    }
    _KNOWN_DEV_VALUES = frozenset(
        {
            DEV_SECRET_KEY,
            DEV_FERNET_SECRET_KEY,
            DEV_DB_PASSWORD,
            DEV_MAIL_PASSWORD,
            "secret_oohhhhhh",  # previous SECRET_KEY default
        }
    )

    def _secret(self, name: str) -> str:
        default = self._SECRET_DEFAULTS[name]
        value = os.environ.get(f"MY_SOLID_APP_{name}")
        if default is None:
            if not value:
                raise ConfigurationError(
                    f"MY_SOLID_APP_{name} must be set (no default is used in production)"
                )
            if value in self._KNOWN_DEV_VALUES:
                raise ConfigurationError(
                    f"MY_SOLID_APP_{name} is set to a publicly known development "
                    "default; provide a real secret"
                )
            return value
        return value or default

    def __init__(self):
        self.SECRET_KEY = self._secret("SECRET_KEY")
        """ Flask session signing key. """
        self.FERNET_SECRET_KEY = self._secret("FERNET_SECRET_KEY")
        """ Fernet key used to encrypt stored TOTP secrets. """

        db_name = os.environ.get("MY_SOLID_APP_DB_NAME", "my_solid_app_db")
        db_user = os.environ.get("MY_SOLID_APP_DB_USER", "my_solid_app_user")
        db_password = quote_plus(self._secret("DB_PASSWORD"))
        db_host = os.environ.get("MY_SOLID_APP_DB_HOST", "127.0.0.1")
        db_port = os.environ.get("MY_SOLID_APP_DB_PORT", "3306")
        self.SQLALCHEMY_DATABASE_URI = (
            f"mysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
        )

        self.MAIL_PASSWORD = self._secret("MAIL_PASSWORD")

    MAIL_SERVER = os.environ.get("MY_SOLID_APP_MAIL_SERVER", "localhost")
    MAIL_PORT = int(os.environ.get("MY_SOLID_APP_MAIL_PORT", 1025))
    MAIL_USE_TLS = False
    MAIL_USE_SSL = os.environ.get("MY_SOLID_APP_MAIL_USE_SSL") == "True"
    MAIL_USERNAME = os.environ.get("MY_SOLID_APP_MAIL_USERNAME", "mysolidapp@mail.com")
    MAIL_DEFAULT_SENDER = os.environ.get(
        "MY_SOLID_APP_MAIL_DEFAULT_SENDER", "mysolidapp@mail.com"
    )
    FILE_LOGGING = os.environ.get("MY_SOLID_APP_FILE_LOGGING", "False") == "True"

    CELERY = {
        "broker_url": f"redis://{MY_SOLID_APP_REDIS_HOST}",
        "result_backend": f"redis://{MY_SOLID_APP_REDIS_HOST}",
        "task_ignore_result": True,
    }

    # Rate limiting. Storage defaults to the Redis instance already used by Celery.
    RATELIMIT_STORAGE_URI = os.environ.get(
        "MY_SOLID_APP_RATELIMIT_STORAGE_URI", f"redis://{MY_SOLID_APP_REDIS_HOST}"
    )
    RATELIMIT_ENABLED = True
    LOGIN_RATE_LIMIT = os.environ.get("MY_SOLID_APP_LOGIN_RATE_LIMIT", "10 per minute")
    LOGIN_ACCOUNT_RATE_LIMIT = os.environ.get(
        "MY_SOLID_APP_LOGIN_ACCOUNT_RATE_LIMIT", "20 per 15 minutes"
    )
    PASSWORD_RESET_RATE_LIMIT = os.environ.get(
        "MY_SOLID_APP_PASSWORD_RESET_RATE_LIMIT", "5 per hour"
    )
    # Number of reverse proxies in front of the API (nginx in the compose files).
    TRUSTED_PROXY_COUNT = int(os.environ.get("MY_SOLID_APP_TRUSTED_PROXY_COUNT", "0"))
    MAX_2FA_ATTEMPTS = int(os.environ.get("MY_SOLID_APP_MAX_2FA_ATTEMPTS", "5"))

    # Session / remember-me cookies are never readable by scripts and are not
    # sent on cross-site subrequests. `Secure` is added by ProdConfig.
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    REMEMBER_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SAMESITE = "Lax"

    # Double-submit CSRF token, see app/csrf.py. The cookie must be readable by
    # the SPA, so it is not HttpOnly.
    CSRF_PROTECTION = True
    CSRF_COOKIE_SECURE = False
    CSRF_COOKIE_SAMESITE = "Lax"


class ProdConfig(BaseConfig):
    """Production settings: every secret must come from the environment."""

    ENV = "prod"
    DEBUG = False

    # Production is served over HTTPS only (nginx redirects port 80).
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    _SECRET_DEFAULTS = {name: None for name in BaseConfig._SECRET_DEFAULTS}


class DevConfig(BaseConfig):
    ENV = "dev"
    DEBUG = True


class TestConfig(BaseConfig):
    TESTING = True
    DEBUG = True

    def __init__(self):
        super().__init__()
        self.SQLALCHEMY_DATABASE_URI = "sqlite://"
        self.RATELIMIT_STORAGE_URI = "memory://"
