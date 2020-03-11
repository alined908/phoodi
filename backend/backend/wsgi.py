import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
os.environ['YELP_API_KEY'] = "U46B4ff8l6NAdldViS7IeS8HJriDeE9Cd5YZXTUmrdzvtv57AUQiYJVVbEPFp30nhL9YAW2-LjAAQ1cBapJ4uqiOYES8tz9EjM85R8ki9l-54Z1d_1OOWLeY5tTuXXYx"
application = get_wsgi_application()
