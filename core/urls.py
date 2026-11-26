"""core URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
import importlib
import logging

from django.contrib import admin
from django.urls import include, path
from rest_framework.authtoken.views import obtain_auth_token # <-- NEW

logger = logging.getLogger(__name__)

urlpatterns = [
    path('', include('home.urls')),
    path("admin/", admin.site.urls),
    path("", include('admin_datta.urls')),
    path('', include('django_dyn_dt.urls')), # <-- NEW: Dynamic_DT Routing   
]

# The "api" app is produced by `python manage.py generate-api -f`, so it may
# legitimately be missing (e.g. on the first build). Only a missing "api"
# module is tolerated; any other import error inside it is raised.
try:
    api_urls = importlib.import_module("api.urls")
except ModuleNotFoundError as exc:
    if exc.name not in ("api", "api.urls"):
        raise
    logger.warning(
        "API routes disabled: the 'api' app was not found. "
        "Run `python manage.py generate-api -f` to generate it."
    )
else:
    urlpatterns.append(path("api/", include(api_urls)))
    urlpatterns.append(path("login/jwt/", view=obtain_auth_token))
