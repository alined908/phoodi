from search.documents import RestaurantDocument
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from elasticsearch import Elasticsearch, TransportError
from elasticsearch_dsl import Search, Q
from meetup.serializers import RestaurantSerializer
from meetup.models import Restaurant
from meetup.helpers import get_user_coordinates
import datetime

class RestaurantDocumentView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        
        query = request.GET.get('q')
        latitude = request.GET.get('latitude')
        longitude = request.GET.get('longitude')      
        radius = request.GET.get('radius', 5)
        prices = request.GET.get('prices')
        rating = request.GET.get('rating')
        categories = request.GET.get('categories')
        sort = request.GET.get('sort', 'rating')
        open_now = request.GET.get('open_now')
        start = request.GET.get('start', 0)
        prices_array = [int(price) for price in prices.split(',')] if prices else []
        categories_array = [category.split("+")[0].lower() for category in categories.split(',')] if categories else []
        s = RestaurantDocument.search()
        coords = [latitude, longitude, radius]
        latitude, longitude, radius = get_user_coordinates(coords, request)

        if not query:
            s = s.source([])
        else:
            q = Q('query_string', query=query, default_field='name') 
            q |= Q('nested', path='categories', query=Q('query_string', query=query, fields=['categories.label', 'categories.api_label']))
            s = s.query(q)

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

        if open_now:
            date = datetime.datetime.now()
            open_now = 2000 * date.weekday() + date.hour * 60 + date.minute
            s = s.query('nested', path='open_hours', query=Q('range', open_hours__open={'lte': open_now}) & Q('range', open_hours__close={'gte': open_now}))        
        
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