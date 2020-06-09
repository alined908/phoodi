from search.documents import UserDocument
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search

class UserDocumentView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        
        query = request.GET.get('q')
        s = UserDocument.search()
        
        if query:
            s = s.query("query_string", query=query, fields=["*_name"])
            s = s[0:50]

        response = s.execute()
        hits = response['hits']['hits']
        users = [hit['_source'].to_dict() for hit in hits]

        return Response(users)