from django.urls import path

from . import views

urlpatterns = [
    path("docs/", views.Docs.as_view()),
]
