# Phoodi [![Build Status](https://travis-ci.com/alined908/phoodi.svg?token=PvKqjKHMMeoZSCY5YeNS&branch=master)](https://travis-ci.com/github/alined908/phoodi)
An app for foodies - **Prototype** @ https://phoodie.me

![phoodie-meetup](https://user-images.githubusercontent.com/47507106/82004652-4fc65180-9618-11ea-9974-51c4066ec5d1.png)

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [Deployment](#deployment) for notes on how to deploy the project on a live system.

**Install Docker and Run**
```
docker-compose build
docker-compose up
```

## Testing
**1. Run tests for backend**
```
cd backend
coverage run --parallel-mode --source="." manage.py test meetup && coverage run --parallel-mode -m pytest
coverage combine
coverage report
```
**2. Run tests for frontend**
```
cd frontend
npm test -- --coverage
```

## Deployment (For AWS EC2, Amazon Linux 2)
**1. SSH into EC2 instance (t2.medium is good, t2.micro stalls due to cpu/memory overusage)**
``` 
ssh -i meetup.pem ec2-user@52.9.232.105
```
**2. Install Docker & Grant Permissions**
```
sudo amazon-linux-extras install docker
sudo service docker start
sudo usermod -a -G docker ec2-user
sudo chkconfig docker on
```
**3. Install Git**
```
sudo yum install -y git
```
**4. Install Docker Compose**
```
sudo curl -L https://github.com/docker/compose/releases/download/1.22.0/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```
**6. Reboot Server**
```
sudo reboot
```
**7. Clone Github Repository** 
```
git clone https://github.com/alined908/meetup.git
```
**8. Install Node**
```
sudo yum install -y gcc-c++ make
curl -sL https://rpm.nodesource.com/setup_13.x | sudo -E bash -
sudo yum install -y nodejs
```
**9. Install Packages Locally**
```
cd meetup/frontend
npm install
```
**10. Run Docker**
```
docker-compose build
docker-compose up
docker exec -i -t <container_id> bash
python manage.py migrate
python manage.py loaddata meetup/fixtures/*.json
```

## Built With

* **Docker/AWS EC2** - Deployment
* **Django** - Backend
* **React/Redux + Jest/Enzyme** - Frontend
* **Postgres** - Database
* **Nginx** - Web Server
* **Redis** - Channel layer for pub/sub
* **Yelp Api** - Generate restaurants
* **Material UI** - Design
* **Travis** - CI

## Todo Completed
- [x] CDN for images
- [x] Elasticsearch - Search bar on top app nav bar, user autocomplete, restaurant autocomplete, etc
- [x] Rewrite Database (Comments as Tree, scalable solution for voting)
- [x] Properly configure statistics for stuff (likes, options count)
- [x] Slugify restaurant url
- [x] Refactor get_nearby
- [x] Validation for models
- [x] Finish writing tests for backend
- [x] Add social authentication (google, facebook, twitter)
- [x] Login and Register Form
- [x] Move drawer to top right dropdown menu
- [x] Adopt Doordash/Yelp Frontpage
- [x] Populate local storage with recent searches
- [x] Add location search bar to food search
- [x] Search page design + flow + logic
- [x] Handle Restaurant Hours logic
- [x] Reconfigure frontend authentication logic (no signup needed to see content)
- [x] Redesign reviews thread layout
- [x] profile private meetup, meetup public
- [x] Update user when email changes
- [x] Filter reviews by new/top/(top weighted by new) 
- [ ] Adopt nicer design of display rating

## Todo General
- [ ] Swagger API
- [ ] Websocket Authentication Flow
- [ ] Test Notifications + search
- [ ] Skeleton loading where applicable
- [ ] Move signals to inside models or Set up celery for asynchronous job processing (convert signals to create task for celery)

-------------------------------------------------------

## Todo Later
- [ ] Complete admin functionality for meetup member
- [ ] Properly document and refactor codebase
- [ ] User's top restaurants list (by city?, map with markers and fly functionality)
- [ ] Add calendar of meetups
- [ ] Use httpOnly cookies for tokens
- [ ] Notification Bar on Top right of navbar
- [ ] Add Custom Notification Model
- [ ] Review Score for food and service and possible secondary factors (interior, location, etc)
- [ ] Social Auth Get Profile Pic and Save to database
- [ ] Finish writing tests for frontend
- [ ] Finish writing tests for consumers
- [ ] Set up locust load test
- [ ] Set up caching system/Optimize (redis)
- [ ] Learn more about web application security (XSS, CSRF, SQL injection, MITM)
- [ ] User Reputation system
- [ ] Add capacity to meetup
- [ ] Fix preferences swapping lag

## Todo Later (Chat)
- [ ] Edit chat messages
- [ ] Upload picture
- [ ] Send invite through chat
- [ ] Who's online in chat room
- [ ] Detect if user is typing