from django.shortcuts import render, get_object_or_404
from django.contrib import messages
from django.utils import timezone
from meetup.models import User
from django.urls import reverse
from django.http import HttpResponse, HttpResponseRedirect


def index(request):
    return render(request, 'meetup/index.html')