import React, {Component} from 'react';
import {Route, Switch} from 'react-router-dom';
import {LogoutComponent, ErrorComponent, RegisterComponent, ChatComponent, MeetupsComponent, HomeComponent, 
    MeetupPageComponent, FriendsComponent, MeetupEventForm, LoginComponent, Invites, MeetupForm, Profile, GlobalMessage
} from "../components"
import AuthenticatedRoute from "../../accounts/AuthenticatedRoute";
import UnAuthenticatedRoute from "../../accounts/UnAuthenticatedRoute";

class Body extends Component {
    render () {
        return (
            <div className="c">
                <Switch>
                    <Route path="/" exact component={HomeComponent}></Route>
                    <UnAuthenticatedRoute path="/login" component={LoginComponent}></UnAuthenticatedRoute>
                    <UnAuthenticatedRoute path="/register" component={(props) => <RegisterComponent {...props} type={"create"}/>}></UnAuthenticatedRoute>
                    <AuthenticatedRoute path="/logout" component={LogoutComponent}></AuthenticatedRoute>
                    <AuthenticatedRoute path="/meetups/:uri/events/:id/edit" component={(props) => <MeetupEventForm {...props} type={"edit"}/>}></AuthenticatedRoute>
                    <AuthenticatedRoute path="/meetups/:uri/new" exact component={(props) => <MeetupEventForm {...props} type={"create"}/>}></AuthenticatedRoute>
                    <AuthenticatedRoute path="/meetups/:uri/edit" exact component={(props) => <MeetupForm {...props} type={"edit"}/>}></AuthenticatedRoute>
                    <AuthenticatedRoute path="/meetups/new" exact component={(props) => <MeetupForm {...props} type={"create"}/>}></AuthenticatedRoute>
                    <AuthenticatedRoute path="/meetups/:uri" component={MeetupPageComponent}></AuthenticatedRoute>
                    <AuthenticatedRoute path="/meetups" exact component={MeetupsComponent}></AuthenticatedRoute>
                    <AuthenticatedRoute path="/chat/:uri" component={ChatComponent}></AuthenticatedRoute>
                    <AuthenticatedRoute path="/chat" exact component={ChatComponent}></AuthenticatedRoute>
                    <AuthenticatedRoute path="/friends" component={FriendsComponent}></AuthenticatedRoute>
                    <AuthenticatedRoute path="/invites" component={Invites}></AuthenticatedRoute>
                    <AuthenticatedRoute path="/profile/edit" component={(props) => <RegisterComponent {...props} type={"edit"}/>}></AuthenticatedRoute>
                    <AuthenticatedRoute path="/profile/:id" component={Profile}></AuthenticatedRoute>
                    <Route component={ErrorComponent}></Route>
                </Switch>
                <GlobalMessage/>
            </div>
        )
    }
}

export default Body