from functools import wraps

from flask import request
from flask_login import current_user, login_required

from app.errors import APIError, APIErrorEnum

MAX_PER_PAGE = 100


def _positive_int_arg(name: str) -> int | None:
    value = request.args.get(name, type=int)
    if request.args.get(name) is not None and (value is None or value < 1):
        raise APIError(
            APIErrorEnum.unknown_error,
            f"Query parameter '{name}' must be a positive integer",
            400,
        )
    return value


def insert_pagination_parameters(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        page = _positive_int_arg("page")
        per_page = _positive_int_arg("per_page")

        if page is not None and per_page is not None:
            return func(*args, **kwargs, page=page, per_page=min(per_page, MAX_PER_PAGE))
        else:
            return func(*args, **kwargs, page=None, per_page=None)

    return wrapper


def admin_required(func):
    # login_required runs first, so anonymous callers get 401 instead of an
    # AttributeError (AnonymousUserMixin has no is_admin) surfacing as a 500.
    @wraps(func)
    @login_required
    def wrapper(*args, **kwargs):
        if not current_user.is_admin:
            raise APIError(
                APIErrorEnum.must_be_admin,
                "You must be an admin to access this resource",
                403,
            )

        return func(*args, **kwargs)

    return wrapper
