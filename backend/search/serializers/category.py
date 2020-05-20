from django_elasticsearch_dsl_drf.serializers import DocumentSerializer
from ..documents import CategoryDocument

class CategoryDocumentSerializer(DocumentSerializer):

    class Meta:
        document = CategoryDocument
        fields = ('__all__')