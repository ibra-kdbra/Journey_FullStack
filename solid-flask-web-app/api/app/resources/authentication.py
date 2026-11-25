import re
import time

import pyotp
from flask import current_app, request, session
from flask_login import current_user, login_required, login_user, logout_user
from flask_restx import Resource
from marshmallow import Schema, fields, validate

from app.config import MY_SOLID_APP_PASSWORD_RESET_TOKEN_EXPIRE_HOURS
from app.db.user import User, UserSchema
from app.errors import APIError, APIErrorEnum
from app.extensions import account_key, api, db, limiter, login_manager
from app.resources.utils import load_or_400
from app.tasks.mail_tasks import (
    send_email_verification_email,
    send_forgot_password_email,
)


def _config_limit(name: str):
    """Limit string read from app config at request time."""
    return lambda: current_app.config[name]


def rate_limits(ip_limit: str, account_limit: str) -> list:
    """Per-client-address and per-account limits for a sensitive endpoint."""
    return [
        limiter.limit(_config_limit(ip_limit)),
        limiter.limit(_config_limit(account_limit), key_func=account_key),
    ]


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)


EMAIL_VALIDATORS = [validate.Length(max=100), validate.Email()]


class RegisterSchema(Schema):
    email = fields.String(required=True, validate=EMAIL_VALIDATORS)
    password = fields.String(required=True)


@api.route("/register")
class Register(Resource):
    def post(self):
        data: dict = load_or_400(RegisterSchema(), request.get_json())
        ensure_password_matches_conditions(data.get("password"))

        if User.query.filter_by(email=data.get("email")).first() is not None:
            raise APIError(
                APIErrorEnum.email_already_exists,
                "An account with this email already exists",
                409,
            )

        new_user = User(email=data.get("email"))
        new_user.set_password(data.get("password"))

        db.session.add(new_user)
        db.session.commit()

        login_user(new_user)

        verification_token = new_user.set_email_verification_token()
        send_email_verification_email.delay(
            receiver=new_user.email, verification_token=verification_token
        )

        db.session.add(new_user)
        db.session.commit()

        current_app.logger.info("New user registered with id %d", new_user.id)

        return UserSchema().dump(new_user)


class LoginSchema(Schema):
    email = fields.String(required=True)
    password = fields.String(required=True)


@api.route("/login")
class Login(Resource):
    decorators = rate_limits("LOGIN_RATE_LIMIT", "LOGIN_ACCOUNT_RATE_LIMIT")

    def post(self):
        data: dict = LoginSchema().load(request.get_json())

        user = User.query.filter_by(email=data.get("email")).first()
        if user is None or not user.is_correct_password(data.get("password")):
            raise APIError(
                APIErrorEnum.wrong_email_password,
                "Could not login with the given email and password",
                401,
            )

        if user.two_factor_enabled:
            session.pop("partially_authenticated_user", None)
            session["partially_authenticated_user"] = user.id
            session["totp_failed_attempts"] = 0
            current_app.logger.info("User with id %d partially logged in", user.id)
        else:
            current_app.logger.info(
                "User with id %d successfully logged in with password only", user.id
            )
            login_user(user)

        return UserSchema().dump(user)


class Login2FASchema(Schema):
    email = fields.String(required=True)
    totp_code = fields.String(required=True)


@api.route("/login_2fa")
class Login2FA(Resource):
    decorators = rate_limits("LOGIN_RATE_LIMIT", "LOGIN_ACCOUNT_RATE_LIMIT")

    def post(self):
        data: dict = Login2FASchema().load(request.get_json())
        totp_code: str = data.get("totp_code")
        user_id = session.get("partially_authenticated_user")

        user = User.query.filter_by(email=data.get("email")).first()
        if (
            user is None
            or not user.two_factor_enabled
            or user_id is None
            or user.id != user_id
        ):
            raise APIError(
                APIErrorEnum.wrong_email_totp_code,
                "Could not login with the given email and code",
                401,
            )

        totp = pyotp.TOTP(user.totp_secret)
        if not totp.verify(totp_code):
            failed_attempts = session.get("totp_failed_attempts", 0) + 1
            if failed_attempts >= current_app.config["MAX_2FA_ATTEMPTS"]:
                # Too many wrong codes: drop the password-verified state so the
                # caller must authenticate with the password again.
                session.pop("partially_authenticated_user", None)
                session.pop("totp_failed_attempts", None)
                current_app.logger.warning(
                    "Partial login for user with id %d cleared after %d failed "
                    "2FA attempts",
                    user.id,
                    failed_attempts,
                )
            else:
                session["totp_failed_attempts"] = failed_attempts
            raise APIError(
                APIErrorEnum.wrong_email_totp_code,
                "Could not login with the given email and code",
                401,
            )

        session.pop("partially_authenticated_user", None)
        session.pop("totp_failed_attempts", None)

        login_user(user)

        current_app.logger.info(
            "User with id %d successfully logged in with 2FA", user.id
        )

        return UserSchema().dump(user)


@api.route("/logout")
class Logout(Resource):
    @login_required
    def post(self):
        logout_user()
        return {}, 200


class ChangePasswordSchema(Schema):
    current_password = fields.String(required=True)
    new_password = fields.String(required=True)


@api.route("/change_password")
class ChangePassword(Resource):
    @login_required
    def post(self):
        data: dict = ChangePasswordSchema().load(request.get_json())

        if not current_user.is_correct_password(data.get("current_password")):
            raise APIError(
                APIErrorEnum.wrong_password,
                "The current password is incorrect",
                409,
            )

        new_password = data.get("new_password")
        if new_password is None or not password_matches_conditions(new_password):
            raise APIError(
                APIErrorEnum.password_does_not_match_conditions,
                "New password does not match conditions",
                409,
            )

        current_user.set_password(new_password)

        db.session.add(current_user)
        db.session.commit()

        return UserSchema().dump(current_user)


class ForgotPasswordSchema(Schema):
    email = fields.String(required=True)


@api.route("/forgot_password")
class ForgotPassword(Resource):
    decorators = rate_limits("PASSWORD_RESET_RATE_LIMIT", "PASSWORD_RESET_RATE_LIMIT")

    def post(self):
        data: dict = ForgotPasswordSchema().load(request.get_json())

        user = User.query.filter_by(email=data.get("email")).first()
        if user is None:
            return {}, 200

        reset_token = user.set_password_reset_token()
        db.session.add(user)
        db.session.commit()

        send_forgot_password_email.delay(receiver=user.email, reset_token=reset_token)

        return {}, 200


class ResetPasswordSchema(Schema):
    email = fields.String(required=True)
    reset_token = fields.String(required=True)
    new_password = fields.String(required=True)


@api.route("/reset_password")
class ResetPassword(Resource):
    decorators = rate_limits("PASSWORD_RESET_RATE_LIMIT", "PASSWORD_RESET_RATE_LIMIT")

    def post(self):
        data: dict = ResetPasswordSchema().load(request.get_json())

        reset_token = data.get("reset_token")
        user = User.query.filter_by(email=data.get("email")).first()
        if user is None or not user.check_password_reset_token(reset_token):
            raise APIError(
                APIErrorEnum.could_not_reset_password_with_token,
                "Could not reset password with the given token",
                400,
            )

        if (int(time.time()) - user.password_reset_time) > (
            MY_SOLID_APP_PASSWORD_RESET_TOKEN_EXPIRE_HOURS * 3600
        ):
            raise APIError(
                APIErrorEnum.token_expired,
                "This token has expired",
                410,
            )

        new_password = data.get("new_password")
        if new_password is None or not password_matches_conditions(new_password):
            raise APIError(
                APIErrorEnum.password_does_not_match_conditions,
                "New password does not match conditions",
                409,
            )

        user.set_password(new_password)
        user.clear_password_reset_token()

        db.session.add(user)
        db.session.commit()

        return {}, 200


class EmailVerificationSchema(Schema):
    email = fields.String(required=True)
    verification_token = fields.String(required=True)


@api.route("/verify_email")
class EmailVerification(Resource):
    def post(self):
        data: dict = EmailVerificationSchema().load(request.get_json())

        verification_token = data.get("verification_token")
        user = User.query.filter_by(email=data.get("email")).first()
        if user is None or not user.check_email_verification_token(verification_token):
            raise APIError(
                APIErrorEnum.could_not_verify_email_with_token,
                "Could not verify email with the given token",
                400,
            )

        user.is_verified = True
        user.clear_email_verification_token()

        db.session.add(user)
        db.session.commit()

        return {}, 200


@api.route("/resend_email_verification")
class ResendEmailVerification(Resource):
    @login_required
    def post(self):
        verification_token = current_user.set_email_verification_token()
        send_email_verification_email.delay(
            receiver=current_user.email, verification_token=verification_token
        )

        db.session.add(current_user)
        db.session.commit()

        return {}, 200


def ensure_password_matches_conditions(password: str | None) -> None:
    if password is None or not password_matches_conditions(password):
        raise APIError(
            APIErrorEnum.password_does_not_match_conditions,
            "Password does not match conditions",
            409,
        )


def password_matches_conditions(password: str) -> bool:
    return (
        len(password) >= 8
        and re.search("[A-Z]", password) is not None
        and re.search("[a-z]", password) is not None
        and re.search("[0-9]", password) is not None
    )


@api.route("/whoami")
class WhoAmI(Resource):
    @login_required
    def get(self):
        return UserSchema().dump(current_user)
