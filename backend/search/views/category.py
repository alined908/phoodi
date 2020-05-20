from django_elasticsearch_dsl_drf.constants import SUGGESTER_COMPLETION
from django_elasticsearch_dsl_drf.filter_backends import (
    SuggesterFilterBackend
)
from django_elasticsearch_dsl_drf.viewsets import DocumentViewSet
from ..documents import CategoryDocument
from ..serializers import CategoryDocumentSerializer
from rest_framework import permissions, status

class CategoryDocumentView(DocumentViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = CategoryDocumentSerializer
    document = CategoryDocument

    filter_backends = [
        SuggesterFilterBackend,
    ]

    suggester_fields = {
        'label_suggest': {
            'field': 'label.suggest',
            'suggesters': [
                SUGGESTER_COMPLETION
            ],
            'options': {
                'size': 20,
                'skip_duplicates': True
            }
        },
        'api_label_suggest': {
            'field': 'api_label.suggest',
            'suggesters': [
                SUGGESTER_COMPLETION
            ],
            'options': {
                'size': 20,
                'skip_duplicates': True
            }
        }
    }

