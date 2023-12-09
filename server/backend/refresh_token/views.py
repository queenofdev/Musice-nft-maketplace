import json
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
import firebase_admin


firebase_app = settings.FIREBASE_APP

auth = firebase_app.auth()


class RefreshToken(APIView):
    """Refresh access token"""

    def __init__(self):
        self.auth = firebase_app.auth()

    def post(self, request):
        try:
            refresh_result = self.auth.refresh(request.data.get("refresh_token"))
            return Response(refresh_result["idToken"])
        except Exception as e:
            error = json.loads(e.args[1])["error"]["message"]
            return Response(f"error: {error}")
