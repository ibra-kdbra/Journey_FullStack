# Flask API Backend

This is the API backend for the Solid-Flask web application.
It is based on [Flask](https://flask.palletsprojects.com/en/stable/) and [SQLAlchemy](https://www.sqlalchemy.org/).
For the rest of the dependencies, see `requirements.txt`.

## Installation

### Local Development

```bash
make deps
make fixtures
make server
```

## Configuration

The API can be configured using environment variables, all present in `app/config.py` and listed in `.env.example`.

In production (`ProdConfig`, used whenever Flask debug is off) `MY_SOLID_APP_SECRET_KEY`,
`MY_SOLID_APP_FERNET_SECRET_KEY`, `MY_SOLID_APP_DB_PASSWORD` and `MY_SOLID_APP_MAIL_PASSWORD`
are required: the app refuses to start if one is missing or equals a development default.
Login, 2FA login and password reset are rate limited (Redis-backed, see the `MY_SOLID_APP_*_RATE_LIMIT`
variables); set `MY_SOLID_APP_TRUSTED_PROXY_COUNT=1` behind a reverse proxy so limits key on the client address.

## Testing

```bash
make test
make test_cov
```

## Versions

- (Python)[https://www.python.org/] 3.13
