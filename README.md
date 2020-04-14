# Meetup App
**Prototype** @ https://phoodie.me

The purpose of the application is to allow friend groups to schedule meetups and decide where to eat quickly.  We always run into the problem where no one knows what to eat, where to eat, and when to eat.  The hope is that this will simplify the process.  Eventually, the goal is to connect people with other nearby people that share common food interests and hobbies. Use cases of this includes college campuses, metropolitan cities, etc. The end goal is to recreate a more social Yelp.

## Walkthrough Video
**Click to watch**  
[![Walkthrough](https://lh3.googleusercontent.com/vA4tG0v4aasE7oIvRIvTkOYTwom07DfqHdUPr6k7jmrDwy_qA_SonqZkw6KX0OXKAdk)](https://www.youtube.com/watch?v=cGb9SDsrlQ0)

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
coverage run --source="." manage.py test meetup
coverage report
```
**2. Run tests for frontend**
```
cd frontend
npm test
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

## Todo General
- [x] Create demo video
- [x] Handle 404 page
- [ ] Change actions to async actions
- [ ] Safari presentation
- [ ] Have to click all fields/ Inconsistent meetup?
- [ ] Specify websocket protocol on link

## Todo Testing 
- [x] Fallback if no latitude/longitude provided.
- [ ] Write tests for frontend
- [ ] Write more tests for api
- [ ] Write tests for consumers
- [ ] Form validation + Validation for time and date

## Todo Authentication
- [x] Switch to simplejwt library
- [x] Authenticate JWT automatically after expiration
- [x] Authenticate Websocket
- [x] Authenticate websocket authomatically after jwt expiration
- [x] Check for refresh token expiration and logout if expired
- [ ] Don't allow websocket to send event even after refresh token expire
- [ ] Use httpOnly cookies for tokens?

## Todo User
- [x] Get user location before render
- [x] User object, settings only show for myself.
- [x] Settings doesnt populate after save and reload
- [ ] Add google social auth 
- [ ] Confirm email, Change password
- [ ] Change name of preference
- [ ] Change presentation of upload avatar
- [ ] Change user model default radius to 25 and relationship to onetoone

## Todo Friends
- [ ] Friends delete
- [ ] Give nickname
- [ ] Add friend button on profile and maybe on the meetup member
- [ ] Wrap autocomplete text

## Todo Invite
- [x] Change meetup friend state if invite sent

## Todo Category
- [x] On reload, category doesn't display meetups

## Todo Meetup
- [x] Meetup email message nice html
- [x] Send email, loading bar
- [x] Loading bar for reload
- [x] Loading bar for restauraunt autocomplete
- [x] Load categories for meetup event custom
- [x] Custom event doesn't automatically render
- [x] Fix Restauraunt autocomplete bug if no user settings
- [x] When clicked on category it 404s
- [x] Combine getMeetups and getPublicMeetups actions
- [ ] Block people, admin functionality for meetup member
- [ ] MeetupEventOption Delete
- [ ] Info dissapears on meetup edit form reload
- [ ] Add scrollable notifications box for meetup
- [ ] Create meetup with member
- [ ] Refactor onTagsChange of MeetupsComponent
- [ ] Add friends, redux action/websockets
- [ ] Create Restauraunt Entity (primary key = yelp_id)
- [ ] Outline itinerary of meetup
- [ ] Reload old events, no options return  
- [ ] Notification Bell doesnt appear if public and member
- [ ] Ban used again for some reason

## Todo Chat
- [x] Add emojis
- [x] Throttle scroll event
- [x] Reload animation on chat scroll up
- [x] More messages below
- [x] Determine if more chat messages can be retrieved for room/render beginning
- [x] Bundle chat messages together
- [x] Handle timestamp logic
- [x] Scrolling causes rerender and expensive calculations
- [x] Make chat input own component
- [ ] Edit chat messages
- [ ] Upload picture
- [ ] Send invite through chat
- [ ] Rearrange chat contacts (and list notifications) based off of whoever messaged recently
- [ ] Notification Bell doesnt appear on new messages
- [ ] Detect if user is typing

## Todo UI
- [x] Change lock icon + default public/private
- [x] Pagination on entities
- [x] Ellipsis on navbar avatar email
- [x] Favicon
- [x] Add preferences warning if no preferences
- [ ] Redo responsive layout + actually learn material design

## Todo UX
- [x] User Settings doesn't work again? for category meetups and regular meetups
- [x] Autocomplete click doesn't load automatically, anotehr click is needed
- [ ] Add transitions (ex Natural transition to new options when meetup event is changed)
- [ ] Animation when logging out forced

## Todo Deploy
- [x] Serve build for react app
- [x] Link Headers (react-helmet)
- [ ] Continuous integration
- [ ] Separate css files
- [ ] Cache images
- [ ] Django settings

## Todo Next Iteration
- [ ] Possible convert forms to Backdrop Form Dialogs
- [ ] Add calendar of meetups
- [ ] Find people who have similar food taste near you?
- [ ] Past activity
- [ ] Elasticsearch? - Search bar on top app nav bar