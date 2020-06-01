from django_elasticsearch_dsl import (Document, fields)
from django_elasticsearch_dsl.registries import registry
from meetup.models import Restaurant
from search.analyzers import html_strip, autocomplete

@registry.register_document
class RestaurantDocument(Document):

    id = fields.IntegerField(attr='id')
    name = fields.TextField(analyzer=autocomplete, attr='name')
    yelp_image = fields.TextField(attr="yelp_image")
    yelp_url = fields.TextField(attr="yelp_url")
    url = fields.TextField(attr="url")
    rating = fields.FloatField(attr="rating")
    price = fields.IntegerField(attr="price")
    address = fields.TextField(attr="location")
    location = fields.GeoPointField(attr="location_indexing")
    address1 = fields.TextField(attr='address1')
    phone = fields.TextField(attr='phone')
    city = fields.TextField(attr='city')
    state = fields.TextField(attr='state')
    categories = fields.NestedField(
        attr="categories_indexing",
        properties={
            'id' : fields.IntegerField(),
            'label': fields.TextField(analyzer="keyword"),
            'api_label': fields.TextField(analyzer="keyword")
        },
        multi=True
    )
    review_count = fields.IntegerField(attr='review_count')
    option_count = fields.IntegerField(attr='option_count')
    comment_count = fields.IntegerField(attr='comment_count')

    class Django:
        model = Restaurant

    class Index:
        name = 'restaurants'
        settings = {
            "number_of_shards": 1,
            "number_of_replicas": 1
        }