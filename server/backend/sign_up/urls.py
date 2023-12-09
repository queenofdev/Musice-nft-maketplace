from django.urls import path

from . import views

urlpatterns = [
    path("signUp/", views.SignUp.as_view()),
]
