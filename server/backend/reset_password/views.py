import json
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings


firebase_app = settings.FIREBASE_APP


class ResetPassword(APIView):
    """Rest password"""

    def __init__(self):
        self.auth = firebase_app.auth()

    def post(self, request):
        try:
            reset_password = self.auth.send_password_reset_email(
                request.data.get("email")
            )
            return Response(reset_password)
        except Exception as e:
            error = json.loads(e.args[1])["error"]["message"]
            return Response(f"error: {error}")
