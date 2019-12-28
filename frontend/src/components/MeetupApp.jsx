import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {Provider} from 'react-redux'
import AuthenticatedRoute from "../accounts/AuthenticatedRoute";
import LoginComponent from "./LoginComponent";
import HeaderComponent from "./HeaderComponent";
import LogoutComponent from "./LogoutComponent";
import ErrorComponent from "./ErrorComponent";
import RegisterComponent from "./RegisterComponent";
import WelcomeComponent from "./WelcomeComponent";
import MainComponent from "./MainComponent";
import HomeComponent from "./HomeComponent";
import {store} from "../store/index";

class MeetupApp extends Component {
    render () {
        return (
            <div className="MeetupApp">
                <Provider store={store}>
                    <Router>
                        <HeaderComponent></HeaderComponent>
                        <Switch>
                            <Route path="/" exact component={HomeComponent}></Route>
                            <Route path="/login" component={LoginComponent}></Route>
                            <Route path="/register" component={RegisterComponent}></Route>
                            <Route path="/logout" component={LogoutComponent}></Route>
                            <AuthenticatedRoute path="/welcome" component={WelcomeComponent}></AuthenticatedRoute>
                            <AuthenticatedRoute path="/meetup" component={MainComponent}></AuthenticatedRoute>
                            <Route component={ErrorComponent}></Route>
                        </Switch>
                    </Router>
                </Provider>
            </div>
        )
    }
}

export default MeetupApp