import React, {Component} from 'react';
import { Router } from 'react-router';
import {Provider} from 'react-redux'
import {Navigation, NotificationWrapper, LocationService} from "./components"
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import {store} from "../store/index";
import {createBrowserHistory} from 'history'
const bold = {fontWeight: 600}

export const history = createBrowserHistory()

const theme = createMuiTheme({
    typography: {
      fontFamily: ['Lato','Roboto','"Helvetica Neue"','Arial','sans-serif'].join(','),
      h1: bold, h2: bold, h3: bold, h4: bold, h5: bold,h6: bold,
      body1:{...bold, fontSize: ".85rem"},
      body2: {...bold, fontSize: ".8rem"},
      button:{...bold, fontSize: ".75rem"}
    }, 
    palette: {
        primary:{
            main: "#006600"
        }
    }
  });

class MeetupApp extends Component {

    render () {
        return (
            <div className="MeetupApp">
                <ThemeProvider theme={theme}>
                    <Provider store={store}>
                        <NotificationWrapper/>
                        <LocationService/>
                        <Router history={history}>
                            <Navigation></Navigation>
                        </Router>
                    </Provider>
                </ThemeProvider>
            </div>
        )
    }
}


export default MeetupApp