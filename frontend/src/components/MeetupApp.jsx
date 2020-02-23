import React, {Component} from 'react';
import { Router } from 'react-router';
import {Provider} from 'react-redux'
import Navigation from "./Navigation"
import {store} from "../store/index";
import createBrowserHistory from 'history/createBrowserHistory'
export const history = createBrowserHistory()

class MeetupApp extends Component {
    // componentDidMount(){
    //     var ws_scheme = window.location.protocol === "https:" ? "wss": "ws"
    //     const path = `${ws_scheme}://localhost:8000/ws/invites/`;
    //     WebSocketInstance.connect(path);
    //     WebSocketInstance.addInviteCallbacks()
    // }

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