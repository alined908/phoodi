from rest_framework import serializers
from social.models import Post, PostImage

class PostSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField('_get_images')

    def _get_images(self, obj):
        images = PostImage.objects.filter(post=obj)
        serializer = PostImageSerializer(images, many=True)
        return serializer.data
    
    class Meta:
        model = Post
        fields = '__all__'

class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = '__all__'