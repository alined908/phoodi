import React, {Component} from 'react';
import { Router } from 'react-router';
import {Provider} from 'react-redux'
import {Navigation, NotificationWrapper} from "./components"
import {store} from "../store/index";
import {createBrowserHistory} from 'history'

export const history = createBrowserHistory()

class MeetupApp extends Component {

    render () {
        return (
            <div className="MeetupApp">
                <Provider store={store}>
                    <NotificationWrapper> 
                    </NotificationWrapper>  
                    <Router history={history}>
                        <Navigation></Navigation>
                    </Router>
                </Provider>
            </div>
        )
    }
}


export default MeetupApp