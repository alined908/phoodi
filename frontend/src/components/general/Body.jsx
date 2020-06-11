import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import {
  LogoutPage,
  ErrorPage,
  RegisterPage,
  Chat,
  Meetups,
  HomePage,
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
  PasswordResetPage,
  PasswordResetConfirmPage,
  EmailActivationPage,
  SearchPage
} from "../components";
import AuthenticatedRoute from "../../accounts/AuthenticatedRoute";
import UnAuthenticatedRoute from "../../accounts/UnAuthenticatedRoute";

class Body extends Component {

  render() {
    return (
      <div className="c">
        <Switch>
          <Route path="/" exact render={(props) => <HomePage {...props} authenticated={this.props.authenticated}/>} />
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
            render={(props) => <RegisterPage {...props} type={"create"} />}
          />
          <Route path="/r/search" component={SearchPage}/>
          <Route path="/restaurants/:uri" component={Restaurant} />
          <AuthenticatedRoute path="/meetups" exact component={Meetups} />
          <AuthenticatedRoute path="/logout" component={LogoutPage} />
          <AuthenticatedRoute path="/meetups/:uri" component={MeetupWrapper} />
          <AuthenticatedRoute path="/chat/:uri" component={Chat} />
          <AuthenticatedRoute path="/chat" exact component={Chat} />
          <AuthenticatedRoute path="/calendar" exact component={Calendar} />
          <AuthenticatedRoute path="/friends" component={Friends} />
          <AuthenticatedRoute path="/invites" component={Invites} />
          <AuthenticatedRoute path="/settings" component={Settings} />
          <Route path="/profile/:id" component={Profile} />
          <Route path="/404" component={ErrorPage} />
          <Route component={ErrorPage} />
        </Switch>
        <GlobalMessage />
      </div>
    );
  }
}

export default Body;
