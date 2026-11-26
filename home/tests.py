import importlib
import sys

from django.conf import settings
from django.test import SimpleTestCase, TestCase


class UrlsApiFallbackTests(SimpleTestCase):
    """core.urls must tolerate a missing `api` app, but log it and not hide other errors."""

    def _reload_urls(self):
        import core.urls
        return importlib.reload(core.urls)

    def test_missing_api_app_logs_warning(self):
        sys.modules.pop("api", None)
        sys.modules.pop("api.urls", None)
        with self.assertLogs("core.urls", level="WARNING") as logs:
            urls = self._reload_urls()
        self.assertIn("generate-api", logs.output[0])
        self.assertFalse(any("api/" in str(p.pattern) for p in urls.urlpatterns))

    def test_other_import_errors_are_not_swallowed(self):
        import types
        fake = types.ModuleType("api")
        fake.__path__ = []
        broken = types.ModuleType("api.urls")

        def boom(name, *a, **k):
            raise ModuleNotFoundError("No module named 'something_else'", name="something_else")

        real = importlib.import_module
        try:
            importlib.import_module = lambda n, *a, **k: boom(n) if n == "api.urls" else real(n, *a, **k)
            with self.assertRaises(ModuleNotFoundError):
                self._reload_urls()
        finally:
            importlib.import_module = real
            sys.modules.pop("api", None)
            sys.modules.pop("api.urls", None)


class StaticStorageTests(SimpleTestCase):
    def test_manifest_storage_when_not_debug(self):
        self.assertFalse(settings.DEBUG)
        self.assertEqual(
            settings.STORAGES["staticfiles"]["BACKEND"],
            "core.storage.ForgivingManifestStorage",
        )


class PagesSmokeTests(TestCase):
    """Guards the template/theme package pins: pages must render."""

    def test_dashboard_and_login_render(self):
        for url in ("/", "/accounts/login/"):
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, 200)
