import React, { Component } from "react";
import AuthenticationService from "./AuthenticationService";
import { Route, Redirect } from "react-router-dom";

class UnAuthenticatedRoute extends Component {
  render() {
    if (!AuthenticationService.isUserLoggedIn()) {
      return (
        <Route {...this.props} other={this.props.location.pathname}></Route>
      );
    } else {
      return <Redirect to="/feed"></Redirect>;
    }
  }
}

export default UnAuthenticatedRoute;
