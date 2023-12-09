from django.urls import path

from . import views

urlpatterns = [
    path("refresh/", views.RefreshToken.as_view()),
]
