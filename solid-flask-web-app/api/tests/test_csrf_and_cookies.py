import pytest

from app.config import DevConfig, ProdConfig
from app.csrf import CSRF_COOKIE_NAME, CSRF_HEADER_NAME

REQUIRED = {
    "MY_SOLID_APP_SECRET_KEY": "s3cret-for-tests-only-1",
    "MY_SOLID_APP_FERNET_SECRET_KEY": "x" * 44,
    "MY_SOLID_APP_DB_PASSWORD": "db-pass-for-tests-only",
    "MY_SOLID_APP_MAIL_PASSWORD": "mail-pass-for-tests-only",
}


@pytest.fixture
def clean_env(monkeypatch):
    for name in REQUIRED:
        monkeypatch.delenv(name, raising=False)
    return monkeypatch


def set_all(monkeypatch):
    for name, value in REQUIRED.items():
        monkeypatch.setenv(name, value)


def csrf_cookie(client):
    cookie = client.get_cookie(CSRF_COOKIE_NAME)
    return cookie.value if cookie else None


class TestCSRF:
    def test_safe_request_sets_readable_cookie(self, raw_client):
        resp = raw_client.get("/whoami")
        assert resp.status_code == 401
        set_cookie = next(
            h
            for h in resp.headers.getlist("Set-Cookie")
            if h.startswith(CSRF_COOKIE_NAME)
        )
        assert "HttpOnly" not in set_cookie  # the SPA has to read it
        assert "SameSite=Lax" in set_cookie

    def test_post_without_token_is_rejected(self, raw_client, user):
        resp = raw_client.post(
            "/login", json={"email": user.email, "password": "password123"}
        )
        assert resp.status_code == 403
        assert resp.get_json()["message"] == "Missing or invalid CSRF token"

    def test_header_must_match_cookie(self, raw_client, user):
        raw_client.get("/whoami")
        resp = raw_client.post(
            "/login",
            json={"email": user.email, "password": "password123"},
            headers={CSRF_HEADER_NAME: "attacker-chosen"},
        )
        assert resp.status_code == 403

    def test_unsigned_token_is_rejected_even_if_header_matches(self, raw_client, user):
        raw_client.set_cookie(CSRF_COOKIE_NAME, "forged.value")
        resp = raw_client.post(
            "/login",
            json={"email": user.email, "password": "password123"},
            headers={CSRF_HEADER_NAME: "forged.value"},
        )
        assert resp.status_code == 403

    def test_matching_token_is_accepted(self, raw_client, user):
        raw_client.get("/whoami")
        resp = raw_client.post(
            "/login",
            json={"email": user.email, "password": "password123"},
            headers={CSRF_HEADER_NAME: csrf_cookie(raw_client)},
        )
        assert resp.status_code == 200

    @pytest.mark.parametrize("method", ["put", "delete", "patch"])
    def test_other_unsafe_methods_are_protected(
        self, raw_client, logged_in_user, method
    ):
        resp = getattr(raw_client, method)("/user/1")
        assert resp.status_code == 403

    def test_logged_in_state_change_needs_token(self, client, raw_client, user):
        # Log in properly, then replay a state-changing call without the header.
        client.post("/login", json={"email": user.email, "password": "password123"})
        raw = client.application.test_client()
        raw.set_cookie("session", client.get_cookie("session").value)
        assert raw.post("/logout").status_code == 403
        assert client.post("/logout").status_code in (200, 204)


class TestCookieFlags:
    def test_prod_config_marks_cookies_secure_lax_httponly(self, clean_env):
        set_all(clean_env)
        config = ProdConfig()
        assert config.SESSION_COOKIE_SECURE is True
        assert config.SESSION_COOKIE_HTTPONLY is True
        assert config.SESSION_COOKIE_SAMESITE == "Lax"
        assert config.REMEMBER_COOKIE_SECURE is True
        assert config.REMEMBER_COOKIE_HTTPONLY is True
        assert config.REMEMBER_COOKIE_SAMESITE == "Lax"
        assert config.CSRF_COOKIE_SECURE is True

    def test_dev_config_stays_usable_over_http(self):
        config = DevConfig()
        assert not getattr(config, "SESSION_COOKIE_SECURE", False)
        assert config.SESSION_COOKIE_SAMESITE == "Lax"

    def test_login_set_cookie_carries_flags(self, clean_env):
        from app.app import create_app
        from app.db.user import User
        from app.extensions import db

        set_all(clean_env)
        config = ProdConfig()
        config.SQLALCHEMY_DATABASE_URI = "sqlite://"
        config.RATELIMIT_STORAGE_URI = "memory://"
        config.CSRF_PROTECTION = False  # this test is about the session cookie
        app = create_app(config)
        with app.app_context():
            db.create_all()
            u = User(email="u@test.com", is_admin=False)
            u.set_password("password123")
            db.session.add(u)
            db.session.commit()
        try:
            resp = app.test_client().post(
                "/login",
                json={"email": "u@test.com", "password": "password123"},
                base_url="https://localhost",
            )
            assert resp.status_code == 200
            session_cookie = next(
                h for h in resp.headers.getlist("Set-Cookie") if h.startswith("session=")
            )
            assert "Secure" in session_cookie
            assert "HttpOnly" in session_cookie
            assert "SameSite=Lax" in session_cookie
        finally:
            with app.app_context():
                db.session.remove()
                db.drop_all()
                db.engine.dispose()
