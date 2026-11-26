import importlib
import types
from unittest import mock

from django.conf import settings
from django.test import SimpleTestCase, TestCase


class UrlsApiFallbackTests(SimpleTestCase):
    """core.urls must tolerate a missing `api` app, log it, and not hide other errors.

    importlib.import_module is mocked, so results never depend on whether a
    generated `api/` directory exists on disk.
    """

    def setUp(self):
        import core.urls
        # Leave core.urls in its real state for the other tests.
        self.addCleanup(importlib.reload, core.urls)

    def _reload_urls_with(self, import_module):
        import core.urls
        with mock.patch.object(importlib, "import_module", import_module):
            return importlib.reload(core.urls)

    @staticmethod
    def _has_api_route(urls):
        return any(str(p.pattern) == "api/" for p in urls.urlpatterns)

    def test_missing_api_app_logs_warning(self):
        def missing(name, *a, **k):
            raise ModuleNotFoundError("No module named 'api'", name="api")

        with self.assertLogs("core.urls", level="WARNING") as logs:
            urls = self._reload_urls_with(missing)
        self.assertIn("generate-api", logs.output[0])
        self.assertFalse(self._has_api_route(urls))

    def test_other_import_errors_are_not_swallowed(self):
        def broken(name, *a, **k):
            raise ModuleNotFoundError("No module named 'something_else'", name="something_else")

        with self.assertRaises(ModuleNotFoundError):
            self._reload_urls_with(broken)

    def test_api_routes_included_when_module_imports(self):
        fake_api_urls = types.ModuleType("api.urls")
        fake_api_urls.urlpatterns = []
        with self.assertNoLogs("core.urls", level="WARNING"):
            urls = self._reload_urls_with(lambda name, *a, **k: fake_api_urls)
        self.assertTrue(self._has_api_route(urls))
        self.assertTrue(any(str(p.pattern) == "login/jwt/" for p in urls.urlpatterns))


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
