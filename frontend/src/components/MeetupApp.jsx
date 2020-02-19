import React, {Component} from 'react';
import {Route, Switch} from 'react-router-dom';
import { Router } from 'react-router';
import {Provider} from 'react-redux'
import AuthenticatedRoute from "../accounts/AuthenticatedRoute";
import LoginComponent from "./auth/LoginComponent";
import HeaderComponent from "./HeaderComponent";
import LogoutComponent from "./auth/LogoutComponent";
import ErrorComponent from "./auth/ErrorComponent";
import RegisterComponent from "./auth/RegisterComponent";
import WelcomeComponent from "./WelcomeComponent";
import ChatComponent from "./chat/ChatComponent"
import MeetupsComponent from "./meetup/MeetupsComponent";
import HomeComponent from "./HomeComponent";
import MeetupPageComponent from "./meetup/MeetupPageComponent"
import FriendsComponent from './invite/FriendsComponent';
import MeetupEventForm from "./meetup/MeetupEventForm"
import {store} from "../store/index";

import createBrowserHistory from 'history/createBrowserHistory'
export const history = createBrowserHistory()

class MeetupApp extends Component {
    render () {
        return (
            <div className="MeetupApp">
                <Provider store={store}>
                    <Router history={history}>
                        <HeaderComponent></HeaderComponent>
                        <div className="c">
                            <Switch>
                                <Route path="/" exact component={HomeComponent}></Route>
                                <Route path="/login" component={LoginComponent}></Route>
                                <Route path="/register" component={RegisterComponent}></Route>
                                <AuthenticatedRoute path="/logout" component={LogoutComponent}></AuthenticatedRoute>
                                <AuthenticatedRoute path="/welcome" component={WelcomeComponent}></AuthenticatedRoute>
                                <AuthenticatedRoute path="/meetups/:uri/new" exact component={MeetupEventForm}></AuthenticatedRoute>
                                <AuthenticatedRoute path="/meetups/:uri" component={MeetupPageComponent}></AuthenticatedRoute>
                                <AuthenticatedRoute path="/meetups" exact component={MeetupsComponent}></AuthenticatedRoute>
                                <AuthenticatedRoute path="/chat" component={ChatComponent}></AuthenticatedRoute>
                                <AuthenticatedRoute path="/friends" component={FriendsComponent}></AuthenticatedRoute>
                                <Route component={ErrorComponent}></Route>
                            </Switch>
                        </div>
                    </Router>
                </Provider>
            </div>
        )
    }
}

export default MeetupApp