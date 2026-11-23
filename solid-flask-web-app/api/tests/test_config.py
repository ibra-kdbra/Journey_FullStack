import pytest

from app import config as cfg
from app.config import (
    DEV_FERNET_SECRET_KEY,
    ConfigurationError,
    DevConfig,
    ProdConfig,
)

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


def test_prod_config_with_all_secrets(clean_env):
    set_all(clean_env)
    config = ProdConfig()
    assert config.SECRET_KEY == REQUIRED["MY_SOLID_APP_SECRET_KEY"]
    assert config.FERNET_SECRET_KEY == REQUIRED["MY_SOLID_APP_FERNET_SECRET_KEY"]


@pytest.mark.parametrize("missing", list(REQUIRED))
def test_prod_config_requires_each_secret(clean_env, missing):
    set_all(clean_env)
    clean_env.delenv(missing)
    with pytest.raises(ConfigurationError, match=missing):
        ProdConfig()


@pytest.mark.parametrize("name", list(REQUIRED))
def test_prod_config_rejects_empty_secret(clean_env, name):
    set_all(clean_env)
    clean_env.setenv(name, "")
    with pytest.raises(ConfigurationError, match=name):
        ProdConfig()


@pytest.mark.parametrize(
    "name,value",
    [
        ("MY_SOLID_APP_SECRET_KEY", "secret_oohhhhhh"),
        ("MY_SOLID_APP_FERNET_SECRET_KEY", DEV_FERNET_SECRET_KEY),
        ("MY_SOLID_APP_DB_PASSWORD", "my_solid_app_password"),
        ("MY_SOLID_APP_MAIL_PASSWORD", "12345678"),
    ],
)
def test_prod_config_rejects_dev_defaults(clean_env, name, value):
    set_all(clean_env)
    clean_env.setenv(name, value)
    with pytest.raises(ConfigurationError, match=name):
        ProdConfig()


def test_dev_and_test_config_keep_dev_defaults(clean_env):
    for config in (DevConfig(), cfg.TestConfig()):
        assert config.SECRET_KEY
        assert config.FERNET_SECRET_KEY == DEV_FERNET_SECRET_KEY


def test_create_app_without_config_fails_in_prod_without_secrets(clean_env):
    from app.app import create_app

    with pytest.raises(ConfigurationError):
        create_app()
