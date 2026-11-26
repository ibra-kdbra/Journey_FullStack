import pytest
from flask.testing import FlaskClient

from app.app import create_app
from app.config import TestConfig
from app.csrf import CSRF_COOKIE_NAME, CSRF_HEADER_NAME
from app.db.user import User
from app.extensions import db as _db


@pytest.fixture
def app():
    """An application for the tests."""
    _app = create_app(config_object=TestConfig())

    with _app.app_context():
        _db.create_all()

    ctx = _app.test_request_context()
    ctx.push()

    yield _app

    ctx.pop()


UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


class CSRFClient(FlaskClient):
    """Test client that behaves like the SPA: echoes the CSRF cookie in the header."""

    def open(self, *args, **kwargs):
        method = kwargs.get("method", "GET").upper()
        if method in UNSAFE_METHODS:
            if self.get_cookie(CSRF_COOKIE_NAME) is None:
                super().open("/whoami")  # any response sets the cookie
            headers = dict(kwargs.get("headers") or {})
            headers.setdefault(CSRF_HEADER_NAME, self.get_cookie(CSRF_COOKIE_NAME).value)
            kwargs["headers"] = headers
        return super().open(*args, **kwargs)


@pytest.fixture
def client(app):
    app.test_client_class = CSRFClient
    return app.test_client()


@pytest.fixture
def raw_client(app):
    """A client that sends no CSRF header on its own."""
    app.test_client_class = FlaskClient
    return app.test_client()


@pytest.fixture
def db(app):
    """A database for the tests."""
    with app.app_context():
        _db.create_all()

    yield _db

    # Explicitly close DB connection
    _db.session.close()
    _db.drop_all()

    # Release connection pool resources
    _db.engine.dispose()


@pytest.fixture
def admin(db):
    _admin = User(
        email="admin@test.com",
        is_admin=True,
    )
    _admin.set_password("password321")

    db.session.add(_admin)
    db.session.commit()

    return _admin


@pytest.fixture
def user(db):
    _user = User(
        email="user@test.com",
        is_admin=False,
    )
    _user.set_password("password123")

    db.session.add(_user)
    db.session.commit()

    return _user


@pytest.fixture
def logged_in_user(client, user):
    client.post("/login", json={"email": user.email, "password": "password123"})
    return user


@pytest.fixture
def logged_in_admin(client, admin):
    client.post("/login", json={"email": admin.email, "password": "password321"})
    return user
