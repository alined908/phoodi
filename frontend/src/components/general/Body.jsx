import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import {
  LogoutPage,
  ErrorPage,
  RegisterPage,
  Chat,
  Meetups,
  HomePage,
  Categories,
  Calendar,
  Category,
  MeetupWrapper,
  Friends,
  LoginPage,
  Invites,
  Profile,
  GlobalMessage,
  Settings,
  Restaurant,
  Restaurants,
  PasswordResetPage,
  PasswordResetConfirmPage,
  EmailActivationPage,
} from "../components";
import AuthenticatedRoute from "../../accounts/AuthenticatedRoute";
import UnAuthenticatedRoute from "../../accounts/UnAuthenticatedRoute";

class Body extends Component {

  render() {
    return (
      <div className="c">
        <Switch>
          <Route path="/" exact component={HomePage} />
          <UnAuthenticatedRoute
            path="/activate/:uid/:token"
            component={EmailActivationPage}
          />
          <UnAuthenticatedRoute
            path="/password/reset/:uid/:token"
            component={PasswordResetConfirmPage}
          />
          <UnAuthenticatedRoute
            path="/password/reset"
            exact
            component={PasswordResetPage}
          />
          <UnAuthenticatedRoute path="/login" component={LoginPage} />
          <UnAuthenticatedRoute
            path="/register"
            component={(props) => <RegisterPage {...props} type={"create"} />}
          />
          <AuthenticatedRoute path="/logout" component={LogoutPage} />
          <AuthenticatedRoute path="/meetups/:uri" component={MeetupWrapper} />
          <AuthenticatedRoute path="/meetups" exact component={Meetups} />
          <AuthenticatedRoute path="/chat/:uri" component={Chat} />
          <AuthenticatedRoute path="/chat" exact component={Chat} />
          <AuthenticatedRoute
            path="/categories/:api_label"
            component={Category}
          />
          <AuthenticatedRoute path="/categories" exact component={Categories} />
          <AuthenticatedRoute path="/calendar" exact component={Calendar} />
          <AuthenticatedRoute path="/restaurants/:uri" component={Restaurant} />
          <AuthenticatedRoute path="/restaurants" exact component={Restaurants}/>
          <AuthenticatedRoute path="/friends" component={Friends} />
          <AuthenticatedRoute path="/invites" component={Invites} />
          <AuthenticatedRoute path="/settings" component={Settings} />
          <AuthenticatedRoute path="/profile/:id" component={Profile} />
          <Route path="/404" component={ErrorPage} />
          <Route component={ErrorPage} />
        </Switch>
        <GlobalMessage />
      </div>
    );
  }
}

export default Body;
