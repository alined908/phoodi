import React, { Component } from "react";
import { Router } from "react-router";
import { Provider } from "react-redux";
import { Navigation, NotificationWrapper, LocationService } from "./components";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import { store } from "../store/index";
import { MuiTheme } from "../constants/themes";
import { createBrowserHistory } from "history";
export const history = createBrowserHistory();

class MeetupApp extends Component {
  render() {
    return (
      <div className="MeetupApp">
        <ThemeProvider theme={createMuiTheme({ ...MuiTheme })}>
          <Provider store={store}>
            <NotificationWrapper />
            <LocationService />
            <Router history={history}>
              <Navigation/>
            </Router>
          </Provider>
        </ThemeProvider>
      </div>
    );
  }
}

export default MeetupApp;
