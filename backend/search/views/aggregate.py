from search.documents import CategoryDocument, RestaurantDocument
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from elasticsearch import Elasticsearch
from elasticsearch_dsl import MultiSearch, Search, Q
from meetup.helpers import get_user_coordinates

class AggregateSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        
        query = request.GET.get('q')
        coords = [request.GET.get('latitude'), request.GET.get('longitude'), request.GET.get('radius')]
        latitude, longitude, radius = get_user_coordinates(coords, request)
        ms = MultiSearch(index=['restaurants', 'categories'])
        
        if query:
            cs = CategoryDocument.search().query("query_string", query=query, default_field="label")
            q = Q('query_string', query=query, default_field='name') 
            q |= Q('nested', path='categories', query=Q('query_string', query=query, default_field='categories.label'))
            rs = RestaurantDocument.search().filter(
                'geo_distance', distance='%smi' % radius, location={"lat": latitude, "lon": longitude}
            ).query(q)

            ms = ms.add(cs)
            ms = ms.add(rs)
            responses = ms.execute()

            aggregate = []
            
            for response in responses:
                hits = response['hits']['hits']
                aggregate += [hit.to_dict() for hit in hits]
        
        else:
            cs = CategoryDocument.search().source([])
            cs = cs[0:10]
            response = cs.execute()
            hits = response['hits']['hits']
            aggregate = [hit.to_dict() for hit in hits]

        return Response(aggregate)