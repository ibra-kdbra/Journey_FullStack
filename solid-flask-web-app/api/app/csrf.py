"""CSRF protection for the cookie-authenticated API (signed double-submit cookie).

The SPA authenticates with a session cookie, so a cross-site page could make
the browser send state-changing requests with it. Every unsafe request
(POST/PUT/PATCH/DELETE) must therefore carry an `X-CSRF-Token` header that
equals the `csrf_token` cookie. A cross-site attacker can neither read that
cookie nor set a custom header on a cross-origin request without CORS approval
(the API sends none). The token is HMAC-signed with the app secret, so a cookie
planted from a sibling subdomain is rejected too.

The cookie is deliberately readable by JavaScript (not HttpOnly): the SPA has
to copy it into the header. It carries no authority by itself.
"""

import hashlib
import hmac
import secrets

from flask import Flask, request

from app.errors import APIError, APIErrorEnum

CSRF_COOKIE_NAME = "csrf_token"
CSRF_HEADER_NAME = "X-CSRF-Token"
SAFE_METHODS = frozenset({"GET", "HEAD", "OPTIONS"})


def _sign(app: Flask, nonce: str) -> str:
    key = app.config["SECRET_KEY"].encode()
    return hmac.new(key, f"csrf:{nonce}".encode(), hashlib.sha256).hexdigest()


def generate_token(app: Flask) -> str:
    nonce = secrets.token_urlsafe(24)
    return f"{nonce}.{_sign(app, nonce)}"


def is_valid_token(app: Flask, token: str | None) -> bool:
    if not token or "." not in token:
        return False
    nonce, _, signature = token.partition(".")
    return hmac.compare_digest(signature, _sign(app, nonce))


def init_csrf(app: Flask) -> None:
    @app.before_request
    def check_csrf():
        if not app.config.get("CSRF_PROTECTION", True):
            return None
        if request.method in SAFE_METHODS:
            return None
        cookie = request.cookies.get(CSRF_COOKIE_NAME)
        header = request.headers.get(CSRF_HEADER_NAME)
        if (
            cookie
            and header
            and is_valid_token(app, cookie)
            and hmac.compare_digest(cookie, header)
        ):
            return None
        app.logger.info(
            "%s %s - rejected: missing or invalid CSRF token",
            request.method,
            request.path,
        )
        return APIError(
            APIErrorEnum.invalid_request, "Missing or invalid CSRF token", 403
        ).to_response()

    @app.after_request
    def set_csrf_cookie(response):
        if not app.config.get("CSRF_PROTECTION", True):
            return response
        if not is_valid_token(app, request.cookies.get(CSRF_COOKIE_NAME)):
            response.set_cookie(
                CSRF_COOKIE_NAME,
                generate_token(app),
                httponly=False,
                secure=app.config["CSRF_COOKIE_SECURE"],
                samesite=app.config["CSRF_COOKIE_SAMESITE"],
                path="/",
            )
        return response
