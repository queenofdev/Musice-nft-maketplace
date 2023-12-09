import json
from django.http import HttpResponse
from rest_framework.views import APIView
from utils.firestore_interface import FirestoreClient


class Docs(APIView):
    """API documentation"""

    def get(self, request):
        list_of_results = []
        firebase_client = FirestoreClient("docs")
        result = firebase_client.get_all(1)
        list_of_results = [x.to_dict() for x in result]
        return HttpResponse(list_of_results)

    def post(self, request):
        firebase_client = FirestoreClient("docs")
        result = firebase_client.create(request.data)
        result = firebase_client.filter("name", "==", "docs")
        print(dir(result), "arsen")
        return HttpResponse(result)

    def delete(self, request):
        firebase_client = FirestoreClient("docs")
        result = firebase_client.delete_by_id(request.data.get("id"))
        return HttpResponse(result)
