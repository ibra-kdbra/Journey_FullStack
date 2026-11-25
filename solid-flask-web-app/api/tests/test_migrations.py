from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from flask_migrate import upgrade

from app.app import create_app
from app.config import TestConfig
from app.extensions import db


def test_migrations_match_models(tmp_path):
    """Applying every migration must leave no difference to the models.

    Replaces the dead ``check-migrations`` job from the nested workflow: a model
    change without a migration fails here, in the root CI's pytest run.
    """
    config = TestConfig()
    config.SQLALCHEMY_DATABASE_URI = f"sqlite:///{tmp_path / 'migrations.db'}"
    app = create_app(config_object=config)

    with app.app_context():
        upgrade(directory="migrations")
        with db.engine.connect() as connection:
            context = MigrationContext.configure(connection)
            diff = compare_metadata(context, db.metadata)
        db.engine.dispose()

    assert diff == []
