from ..documents import CategoryDocument
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search

class CategoryDocumentView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, *args, **kwargs):
        query = request.GET.get('q')
        s = CategoryDocument.search()
        
        if query:
            s = s.query("query_string", query=query, default_field="label")
            s = s[0:10]
        else:
            s = s.source([])
            s = s[0:200]

        response = s.execute()
        hits = response['hits']['hits']
        categories = [hit['_source'].to_dict() for hit in hits]

        return Response(categories)

        

