from meetup.models import User, Review, Comment, Vote, Restaurant, VoteChoice
from meetup.serializers import ReviewSerializer, CommentSerializer, RestaurantSerializer
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth.hashers import make_password
from django.test import TestCase
import json

client = APIClient()
up = VoteChoice.UP.value
down = VoteChoice.DOWN.value
novote = VoteChoice.NOVOTE.value

class RestaurantTest(TestCase):
    fixtures = ("1_users.json", "3_restaurants.json")

    def setUp(self):
        self.restaurant = Restaurant.objects.get(pk=1)

    def create_restaurant(self, name, city):
        data = {
            "name": name,
            "yelp_image": "something",
            "yelp_url": "something",
            "rating": 8,
            "latitude": 30.0,
            "longitude": 30.0,
            "price": "$",
            "location": "somewhere",
            "address1": "somewhere",
            "city": city,
            "state": "CA",
            "zipcode": "99999",
            "country": "US",
            "phone": "something",
            "categories": "something"
        }
        restaurant = Restaurant.objects.create(**data)
        return restaurant
    
    def test_RestaurantListView_GET(self):
        pass

    def test_RestaurantView_GET(self):
        response = client.get('/api/restaurants/%s/' % self.restaurant.url)
        serializer = RestaurantSerializer(self.restaurant)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, serializer.data)

    def test_RestaurantView_POST(self):
        pass

    def test_slugify_restaurant(self):
        restaurant = self.create_restaurant("Mcdonalds", "Berkeley")
        self.assertEqual(restaurant.url, "mcdonalds-berkeley")

    def test_slugify_restaurant_duplicate(self):
        restaurant = self.create_restaurant("Mcdonalds", "Berkeley")
        restaurant2 = self.create_restaurant("Mcdonalds", "Berkeley")
        self.assertEqual(restaurant2.url, "mcdonalds-berkeley-2")

class ReviewTest(TestCase):
    fixtures = ("1_users.json","3_restaurants.json",)
    
    def setUp(self):
        self.restaurant = Restaurant.objects.get(pk=1)
        self.review = Review.objects.get(pk=1)

    def authenticate(self):
        self.user = User.objects.get(pk=1)
        client.force_authenticate(user=self.user)

    def create_review(self, rating = 8):
        self.authenticate()
        response = client.post(
            '/api/restaurants/%s/reviews/' % self.restaurant.url, 
            data=json.dumps({"text": "Awesome place", "rating": rating}, default=str),
            content_type="application/json"
        )
        return response
        
    def test_ReviewListView_GET(self):
        response = client.get("/api/restaurants/%s/reviews/" % self.restaurant.url)
        serializer = ReviewSerializer([self.review], many=True)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, serializer.data)

    def test_ReviewListView_POST(self):
        response = self.create_review()
        review = Review.objects.get(pk=2)
        serializer = ReviewSerializer(review)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, serializer.data)

    def test_ReviewView_GET(self):
        response = client.get("/api/restaurants/%s/reviews/%s/" % (self.restaurant.url, self.review.id))
        serializer = ReviewSerializer(self.review)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, serializer.data)

    def test_ReviewView_GET_invalid_restaurant(self):
        response = client.get("/api/restaurants/%s/reviews/%s/" % ("random", self.review.id))
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data, {"error": "Restaurant does not exist."})

    def test_ReviewView_GET_invalid_review(self):
        response = client.get("/api/restaurants/%s/reviews/%s/" % (self.restaurant.url, 100))
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data, {"error": "Review does not exist."})

    def test_restaurant_review_count_increments(self):
        self.create_review()
        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.review_count, 1)

    def test_restaurant_rating_changes(self):
        self.assertEqual(self.restaurant.rating, 8)
        self.create_review(6)
        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.rating, 6)
        self.create_review(8)
        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.rating, 7.0)
        
class CommentTest(TestCase):
    fixtures = ("1_users.json","3_restaurants.json",)

    def setUp(self):
        self.restaurant = Restaurant.objects.get(pk=1)
        self.review = Review.objects.get(pk=1)
        self.valid_comment = {"text": "I agree", "parent": None, "review_id": 1}
    
    def authenticate(self):
        self.user = User.objects.get(pk=1)
        client.force_authenticate(user=self.user)

    def create_comment(self, type, review):
        self.authenticate()
        response = client.post(
            '/api/reviews/%s/comments/' % review,
            data=json.dumps(type, default=str),
            content_type="application/json"
        )
        return response

    def test_CommentListView_POST(self):
        response = self.create_comment(self.valid_comment, self.review.id)
        comment = Comment.objects.get(pk=1)
        serializer = CommentSerializer(comment)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, serializer.data)

    def test_CommentListView_POST_invalid_review(self):
        response = self.create_comment(self.valid_comment, 100)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data, {"error": "Review does not exist."})

    def test_CommentView_GET(self):
        self.create_comment(self.valid_comment, self.review.id)
        comment = Comment.objects.last()
        response = client.get('/api/reviews/%s/comments/%s/' % (self.review.id, comment.id))
        serializer = CommentSerializer(comment)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, serializer.data)
    
    def test_increment_comment_counts(self):
        self.create_comment(self.valid_comment, self.review.id)
        self.review.refresh_from_db()
        self.restaurant.refresh_from_db()
        self.assertEqual(self.review.comment_count, 1)
        self.assertEqual(self.restaurant.comment_count, 1)

class VoteTest(TestCase):
    fixtures = ("1_users.json","3_restaurants.json",)
    

    def setUp(self):
        self.restaurant = Restaurant.objects.get(pk=1)
        self.review = Review.objects.get(pk=1)
        self.user = User.objects.get(pk=1)
        self.valid_vote_review = {'value': 1, 'review': 1}
        self.comment_payload = {"user": self.user, "review": self.review, "parent": None, "text": "great"}
        self.comment = Comment.objects.create(**self.comment_payload)
        self.valid_vote_comment = {"value": 1, "comment": self.comment.pk}

    def authenticate(self):
        client.force_authenticate(user=self.user)

    def create_vote(self, vote_type):
        self.authenticate()
        response = client.post(
            "/api/vote/", 
            data=json.dumps(vote_type, default=str),
            content_type="application/json"
        )
        return response

    def handle_vote_helper(self, value, score, new_value, new_value_score):
        vote = Vote.objects.create(user = self.user, content_object = self.review, value=value)
        self.review.refresh_from_db()
        self.user.refresh_from_db()
        self.assertEqual(vote.value, score)
        self.assertEqual(self.review.vote_score, score)
        self.assertEqual(self.user.review_karma, score)
        vote.handle_vote(new_value)
        self.review.refresh_from_db()
        self.user.refresh_from_db()
        vote.refresh_from_db()
        self.assertEqual(vote.value, new_value_score)
        self.assertEqual(self.review.vote_score, new_value_score)
        self.assertEqual(self.user.review_karma, new_value_score)
       
    def test_VoteView_POST_review(self):
        response = self.create_vote(self.valid_vote_review)
        self.assertEqual(response.status_code, 204)
        self.review.refresh_from_db()
        self.assertEqual(self.review.vote_score, 1)

    def test_VoteView_POST_comment(self):
        response = self.create_vote(self.valid_vote_comment)
        self.assertEqual(response.status_code, 204)
        comment = Comment.objects.last()
        self.assertEqual(comment.vote_score, 1)

    def test_VoteView_POST_invalid(self):
        pass

    def test_handle_vote_upvote_and_upvote(self):
        self.handle_vote_helper(value=up, score=1, new_value=up, new_value_score=0)

    def test_handle_vote_downvote_and_downvote(self):
        self.handle_vote_helper(value=down, score=-1, new_value=down, new_value_score= 0)

    def test_handle_vote_downvote_and_upvote(self):
        self.handle_vote_helper(value=down, score=-1, new_value = up, new_value_score=1)

    def test_handle_vote_upvote_and_downvote(self):
        self.handle_vote_helper(value=up, score=1, new_value = down, new_value_score=-1)

    def test_handle_vote_novote_and_upvote(self):
        self.handle_vote_helper(value=novote, score=0, new_value=up, new_value_score=1)
    
    def test_handle_vote_novote_and_downvote(self):
        self.handle_vote_helper(value=novote, score=0, new_value=down, new_value_score=-1)