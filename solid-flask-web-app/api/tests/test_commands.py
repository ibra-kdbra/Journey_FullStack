from app.commands import create_admin
from app.db.user import User


class TestCreateAdminCommand:
    def test_create_admin(self, app, db):
        result = app.test_cli_runner().invoke(
            create_admin, ["--email", "root@test.com", "--password", "Str0ngpassword"]
        )

        assert result.exit_code == 0
        admin = User.query.filter_by(email="root@test.com").first()
        assert admin is not None
        assert admin.is_admin
        assert admin.is_correct_password("Str0ngpassword")

    def test_create_admin_weak_password(self, app, db):
        result = app.test_cli_runner().invoke(
            create_admin, ["--email", "root@test.com", "--password", "a"]
        )

        assert result.exit_code != 0
        assert "Password must be" in result.output
        assert User.query.count() == 0
