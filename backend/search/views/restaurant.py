from ..documents import RestaurantDocument
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from elasticsearch import Elasticsearch
from elasticsearch_dsl import Search, Q
from meetup.serializers import RestaurantSerializer
from meetup.models import Restaurant
from django.db.models import Case, When

class RestaurantDocumentView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        
        query = request.GET.get('q')
        latitude = request.GET.get('latitude')
        longitude = request.GET.get('longitude')      
        radius = request.GET.get('radius', 25)
        prices = request.GET.get('prices')
        rating = request.GET.get('rating')
        categories = request.GET.get('categories')
        sort = request.GET.get('sort', 'rating')
        start = request.GET.get('start', 0)
        prices_array = [int(price) for price in prices.split(',')] if prices else []
        categories_array = [category for category in categories.split(',')] if categories else []
        s = RestaurantDocument.search()

        if not query:
            s = s.source([])
        else:
            s = s.query("query_string", query=query, fields=["name", "categories"])
        
        s = s.filter('geo_distance', distance='%smi' % radius, location={"lat": latitude, "lon": longitude})
        
        if prices_array:
            s = s.filter('terms', price = prices_array)

        if categories_array:
            s = s.filter('nested', path='categories', query = Q('terms', categories__label=categories_array))

        if rating:
            s = s.filter('range', rating={'gte': rating})

        if sort == 'rating':
            s = s.sort('-rating')
        else:
            s = s.sort('-review_count', '-rating')
        
        count = s.count()

        s = s[int(start): int(start) + 10]

        response = s.execute()
        hits = response['hits'].to_dict()

        return Response({'count': count, 'hits': hits['hits']})

        # ids = [hit['_source']['id'] for hit in hits]
        # preserved = Case(*[When(pk=pk, then=pos) for pos, pk in enumerate(ids)])
        # restaurants = Restaurant.objects.filter(id__in=ids).order_by(preserved)

        # serializer = RestaurantSerializer(restaurants, many=True)
        # return Response(serializer.data)