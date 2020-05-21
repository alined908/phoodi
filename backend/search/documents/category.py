from django_elasticsearch_dsl import (Document, fields)
from django_elasticsearch_dsl.registries import registry
from meetup.models import Category
from .analyzers import html_strip, autocomplete

@registry.register_document
class CategoryDocument(Document):

    id = fields.IntegerField(attr='id')

    label = fields.TextField(
        analyzer=autocomplete,
        attr='label'
    )

    api_label = fields.TextField(
        attr='api_label',
    )    

    class Django:
        model = Category
    
    class Index:
        name = 'categories'
        settings = {
            "number_of_shards": 1,
            "number_of_replicas": 1
        }