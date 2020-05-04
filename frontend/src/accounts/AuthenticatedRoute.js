import React, { Component } from "react";
import AuthenticationService from "./AuthenticationService";
import { Route, Redirect } from "react-router-dom";

class AuthenticatedRoute extends Component {
  render() {
    if (AuthenticationService.isUserLoggedIn()) {
      return <Route {...this.props} />;
    } else {
      return (
        <Redirect
          to={{
            pathname: "/login/",
            state: {
              from: this.props.location.pathname,
            },
          }}
        />
      );
    }
  }
}

export default AuthenticatedRoute;
