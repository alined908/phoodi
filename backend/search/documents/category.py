from django_elasticsearch_dsl import (Document, fields)
from django_elasticsearch_dsl.registries import registry
from django_elasticsearch_dsl_drf.compat import KeywordField, StringField
from elasticsearch_dsl import analyzer
from meetup.models import Category
from .analyzers import html_strip

@registry.register_document
class CategoryDocument(Document):
    class Index:
        name = 'categories'
        settings = {
            "number_of_shards": 1,
            "number_of_replicas": 1
        }

    id = fields.IntegerField(attr='id')

    label = StringField(
        analyzer=html_strip,
        attr='label',
        fields = {
            'raw': KeywordField(),
            'suggest': fields.CompletionField()
        }
    )

    api_label = StringField(
        analyzer=html_strip,
        attr='api_label',
        fields = {
            'raw': KeywordField(),
            'suggest': fields.CompletionField()
        }
    )

    class Django(object):
        model = Category
