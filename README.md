# Phoodi
**Prototype** @ https://phoodie.me

The purpose of the application is to allow friend groups to schedule meetups and decide where to eat quickly.  We always run into the problem where no one knows what to eat, where to eat, and when to eat.  The hope is that this will simplify the process.  Eventually, the goal is to connect people with other nearby people that share common food interests and hobbies. Use cases of this includes college campuses, metropolitan cities, etc. The end goal is to recreate a more social Yelp.

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
coverage run --parallel-mode --source="." manage.py test meetup
coverage run --parallel-mode -m pytest
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
* **React/Redux** - Frontend
* **Postgres** - Database
* **Nginx** - Web Server
* **Redis** - Channel layer for django channels
* **Yelp Api** - Generate food options
* **Material UI** - Design

## Author
* **Daniel Lee** 

## Todo Bugs
- [ ] Don't allow websocket to send event even after refresh token expire
- [ ] Logout , websocket (notification wrapper cant find property id of this.props.user)
- [ ] TypeError: Cannot read property 'scrollIntoView' of null

## Todo Deploy
- [ ] Separate dev and prod settings
- [ ] Continuous integration
- [ ] Django settings

---------------------------------------------------------------

## Todo Next Iteration
- [ ] Optimize performance
- [ ] Cache images
- [ ] Validation for models
- [ ] Finish writing tests for frontend
- [ ] Add google, facebook, twitter social auth
- [ ] Edit chat messages
- [ ] Upload picture
- [ ] Refactor code/database
- [ ] Send invite through chat
- [ ] Who's online
- [ ] Detect if user is typing
- [ ] Use httpOnly cookies for tokens
- [ ] Rewrite Database (Comments as Tree, scalable solution for voting)
- [ ] Set up caching system (redis)
- [ ] Set up celery for asynchronous job processing (convert signals to create task for celery)
- [ ] Notification Bar on Top right of navbar
- [ ] Add calendar of meetups
- [ ] Elasticsearch - Search bar on top app nav bar, user autocomplete, restaurant autocomplete, etc
- [ ] Properly document stuff
- [ ] Position aware scrolling (meetup tree) (Panda is anchor, dashes are bamboo)

## Todo Later/Nice Stuff
- [ ] Skeleton loading where applicable (preferences)
- [ ] Update user when email changes
- [ ] Find people who have similar food taste near you?
- [ ] Eliminate user_id from preferences api calls
- [ ] Some sort of reputation system
- [ ] Guest accounts
- [ ] Admin functionality for meetup member
- [ ] Change name of preference
- [ ] Add capacity if wanted and adjust circles to meetups
