from django.urls import path

from . import views

urlpatterns = [
    path("logout/", views.Logout.as_view()),
]
