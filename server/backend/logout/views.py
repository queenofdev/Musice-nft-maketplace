import json
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings

firebase_app = settings.FIREBASE_APP


class Logout(APIView):
    def __init__(self):
        self.auth = firebase_app.auth()

    def get(self, request):
        try:
            self.auth.signOut()
            return Response("success")
        except Exception as e:
            error = json.loads(e.args[1])["error"]["message"]
            return Response(f"error: {error}")
