import pyotp
import pytest
from flask import session

from app.db.user import User
from app.errors import APIErrorEnum


def login(client, email="user@test.com", password="wrong-password"):
    return client.post("/login", json={"email": email, "password": password})


class TestLoginRateLimit:
    def test_eleventh_rapid_login_is_rejected(self, client, user):
        statuses = [login(client).status_code for _ in range(11)]
        assert statuses[:10] == [401] * 10
        assert statuses[10] == 429

    def test_rate_limited_response_body(self, client, user):
        for _ in range(10):
            login(client)
        response = login(client)
        assert response.status_code == 429
        assert response.json["error"] == APIErrorEnum.too_many_requests.value

    def test_correct_password_is_also_blocked_once_limited(self, client, user):
        for _ in range(10):
            login(client)
        response = login(client, password="password123")
        assert response.status_code == 429

    def test_per_account_limit_applies_across_addresses(self, client, app, user):
        app.config["LOGIN_ACCOUNT_RATE_LIMIT"] = "3 per hour"
        statuses = []
        for i in range(5):
            response = client.post(
                "/login",
                json={"email": user.email, "password": "nope"},
                environ_overrides={"REMOTE_ADDR": f"10.0.0.{i + 1}"},
            )
            statuses.append(response.status_code)
        assert statuses == [401, 401, 401, 429, 429]

    def test_other_account_not_affected(self, client, app, user, admin):
        app.config["LOGIN_ACCOUNT_RATE_LIMIT"] = "2 per hour"
        for _ in range(3):
            login(client)
        response = login(client, email=admin.email, password="password321")
        assert response.status_code == 200


class TestPasswordResetRateLimit:
    def test_forgot_password_limited(self, client, user):
        statuses = [
            client.post(
                "/forgot_password", json={"email": "nobody@test.com"}
            ).status_code
            for _ in range(6)
        ]
        assert statuses == [200] * 5 + [429]

    def test_reset_password_limited(self, client, user):
        body = {"email": user.email, "reset_token": "bad", "new_password": "Abcdefg1"}
        statuses = [
            client.post("/reset_password", json=body).status_code for _ in range(6)
        ]
        assert statuses[:5] == [400] * 5
        assert statuses[5] == 429


class TestTwoFactorLockout:
    @pytest.fixture
    def user_with_2fa(self, db, user):
        user.totp_secret = pyotp.random_base32()
        user.two_factor_enabled = True
        db.session.add(user)
        db.session.commit()
        return user

    def wrong_code(self, user):
        valid = pyotp.TOTP(user.totp_secret).now()
        return "000000" if valid != "000000" else "000001"

    def test_partial_session_cleared_after_repeated_failures(
        self, client, app, user_with_2fa
    ):
        max_attempts = app.config["MAX_2FA_ATTEMPTS"]
        app.config["LOGIN_RATE_LIMIT"] = "1000 per minute"
        app.config["LOGIN_ACCOUNT_RATE_LIMIT"] = "1000 per hour"
        with client:
            assert login(client, password="password123").status_code == 200
            assert session["partially_authenticated_user"] == user_with_2fa.id

            for _ in range(max_attempts):
                response = client.post(
                    "/login_2fa",
                    json={
                        "email": user_with_2fa.email,
                        "totp_code": self.wrong_code(user_with_2fa),
                    },
                )
                assert response.status_code == 401

            assert "partially_authenticated_user" not in session

            # Even the correct code no longer works without a fresh password login.
            response = client.post(
                "/login_2fa",
                json={
                    "email": user_with_2fa.email,
                    "totp_code": pyotp.TOTP(user_with_2fa.totp_secret).now(),
                },
            )
            assert response.status_code == 401

    def test_login_2fa_is_rate_limited(self, client, user_with_2fa):
        statuses = [
            client.post(
                "/login_2fa",
                json={"email": user_with_2fa.email, "totp_code": "000000"},
            ).status_code
            for _ in range(11)
        ]
        assert statuses[10] == 429

    def test_successful_2fa_login_resets_counter(self, client, user_with_2fa):
        with client:
            login(client, password="password123")
            client.post(
                "/login_2fa",
                json={
                    "email": user_with_2fa.email,
                    "totp_code": self.wrong_code(user_with_2fa),
                },
            )
            response = client.post(
                "/login_2fa",
                json={
                    "email": user_with_2fa.email,
                    "totp_code": pyotp.TOTP(user_with_2fa.totp_secret).now(),
                },
            )
            assert response.status_code == 200
            assert "totp_failed_attempts" not in session
            assert User.query.count() == 1
