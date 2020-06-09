from django_elasticsearch_dsl import (Document, fields)
from django_elasticsearch_dsl.registries import registry
from meetup.models import User
from search.analyzers import html_strip, autocomplete

@registry.register_document
class UserDocument(Document):

    email = fields.TextField(
        analyzer=autocomplete,
        attr='email'
    )

    first_name = fields.TextField(
        analyzer=autocomplete,
        attr='first_name',
    )   

    last_name = fields.TextField(
        analyzer=autocomplete,
        attr='last_name',
    )

    avatar = fields.TextField(
        attr='avatar_index'
    )

    class Django:
        model = User
    
    class Index:
        name = 'users'
        settings = {
            "number_of_shards": 1,
            "number_of_replicas": 1
        }