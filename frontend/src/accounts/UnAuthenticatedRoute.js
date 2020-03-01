import React, {Component} from 'react';
import AuthenticationService from './AuthenticationService';
import {Route, Redirect} from 'react-router-dom';

class UnAuthenticatedRoute extends Component {
    render(){
        if (!AuthenticationService.isUserLoggedIn()){
            return <Route {...this.props}></Route>
        } else{
            return <Redirect to="/"></Redirect>
        }
    }
}

export default UnAuthenticatedRoute