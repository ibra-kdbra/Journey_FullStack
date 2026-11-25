from marshmallow import Schema, ValidationError

from app.errors import APIError, APIErrorEnum


def load_or_400(schema: Schema, data) -> dict:
    """Load request data, turning schema validation errors into a 400 APIError.

    flask-restx answers a bare marshmallow ValidationError with the submitted
    payload (its ``data`` attribute), so it has to be translated here.
    """
    try:
        return schema.load(data)
    except ValidationError as error:
        fields = ", ".join(sorted(str(key) for key in error.messages))
        raise APIError(
            APIErrorEnum.invalid_request, f"Invalid request data: {fields}", 400
        ) from error


def pagination_query(model, page: int, per_page: int) -> tuple[list, dict]:
    pagination_result = model.query.paginate(page=page, per_page=per_page)
    return pagination_result.items, {
        "page": pagination_result.page,
        "per_page": pagination_result.per_page,
        "total_pages": pagination_result.pages,
        "total_items": pagination_result.total,
    }
