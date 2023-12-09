from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("sign_up.urls")),
    path("", include("login.urls")),
    path("", include("logout.urls")),
    path("", include("docs.urls")),
    path("", include("refresh_token.urls")),
    path("", include("reset_password.urls")),
]
