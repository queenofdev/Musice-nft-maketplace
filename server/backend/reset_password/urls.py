from django.urls import path

from . import views

urlpatterns = [
    path("reset_password/", views.ResetPassword.as_view()),
]
