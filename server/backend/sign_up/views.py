import json
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings

firebase_app = settings.FIREBASE_APP



class SignUp(APIView):
    """ Signing up a new user"""
    def __init__(self):
        self.auth = firebase_app.auth()

    def post(self, request):
        try:
            user = self.auth.create_user_with_email_and_password(
                request.data.get("email"),
                request.data.get("password"),
            )
            return Response(user)
        except Exception as e:
            error = json.loads(e.args[1])["error"]["message"]
            return Response(f"error: {error}")
