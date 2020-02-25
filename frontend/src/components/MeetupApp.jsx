import React, {Component} from 'react';
import { Router } from 'react-router';
import {Provider} from 'react-redux'
import Navigation from "./Navigation"
import {store} from "../store/index";
import createBrowserHistory from 'history/createBrowserHistory'
export const history = createBrowserHistory()

class MeetupApp extends Component {
    render () {
        return (
            <div className="MeetupApp">
                <Provider store={store}>
                    <Router history={history}>
                        <Navigation></Navigation>
                    </Router>
                </Provider>
            </div>
        )
    }
}

export default MeetupApp