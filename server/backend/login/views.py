import json
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings


firebase_app = settings.FIREBASE_APP


class Login(APIView):
    """ Login a user"""
    def __init__(self):
        self.auth = firebase_app.auth()

    def post(self, request):
        try:
            login = self.auth.sign_in_with_email_and_password(
                request.data.get("email"),
                request.data.get("password"),
            )
            return Response(login)
        except Exception as e:
            error = json.loads(e.args[1])["error"]["message"]
            return Response(f"error: {error}")
