import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actions from "../../actions";

class LogoutComponent extends Component {
    componentDidMount(){
        this.props.signout();
    }

    render () {
        return (
            <>
                <h1>You are logged out</h1>
                <div className="container">Thank you for using our application</div>
            </>
        )
    }
}

export default connect(null, actions)(LogoutComponent);