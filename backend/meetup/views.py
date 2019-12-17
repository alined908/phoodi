from django.shortcuts import render, get_object_or_404
from django.contrib import messages
from meetup.models import User
from django.urls import reverse
from rest_framework.decorators import api_view
from django.http import HttpResponse, HttpResponseRedirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from meetup.serializers import UserSerializer, UserSerializerWithToken

@api_view(['GET'])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

class CreateUserView(APIView):
    permission_classes = (permissions.AllowAny, )
    def post(self,request):
        user = request.data.get('user')
        if not user:
            return Response({'response' : 'error', 'message' : 'No data found'})
        serializer = UserSerializerWithToken(data = user)
        if serializer.is_valid():
            saved_user = serializer.save()
        else:
            return Response({"response" : "error", "message" : serializer.errors})
        return Response({"response" : "success", "message" : "user created succesfully"})

def index(request):
    return render(request, 'meetup/index.html')