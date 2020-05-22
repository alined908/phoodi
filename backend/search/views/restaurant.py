from ..documents import RestaurantDocument
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search

class RestaurantDocumentView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        
        query = request.GET.get('q')
        latitude = request.GET.get('latitude')
        longitude = request.GET.get('longitude')      
        radius = request.GET.get('radius', 25)  
        s = RestaurantDocument.search()

        if query:
            s = s.filter(
                'geo_distance', distance='%smi' % radius, location={"lat": latitude, "lon": longitude}
            ).query(
                "query_string", query=query, fields=["name", "categories"]
            )
        else:
            s = s.source([]).filter(
                'geo_distance', distance='%smi' % radius, location={"lat": latitude, "lon": longitude}
            )
            
        s = s[0:10]
        response = s.execute()
        hits = response['hits']['hits']
        restaurants = [hit.to_dict() for hit in hits]

        return Response(restaurants)