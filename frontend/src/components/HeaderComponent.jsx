import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import NotificationBar from './invite/NotificationBar'

class HeaderComponent extends Component {
    render(){
        return (
            <header>
                <nav className="navbar navbar-expand-md navbar-dark bg-dark">
                    <div><a href="http://localhost:3000" className="navbar-brand">Meetup</a></div>
                    <ul className="navbar-nav">
                        <li><Link className="nav-link" to="/">Home</Link></li>
                        {this.props.authenticated && <li><Link className="nav-link" to="/chat">Chat</Link></li>}
                        {this.props.authenticated && <li><Link className="nav-link" to="/meetups">Meetups</Link></li>}
                        {this.props.authenticated && <li><Link className="nav-link" to="/friends">Friends</Link></li>}
                    </ul>
                    <ul className="navbar-nav navbar-collapse justify-content-end">
                        {!this.props.authenticated && <li><Link className="nav-link" to="/login">Login</Link></li>}
                        {!this.props.authenticated  && <li><Link className="nav-link" to="/register">Register</Link></li>}
                        {this.props.authenticated && <NotificationBar></NotificationBar>}
                        {this.props.authenticated  && <li><Link className="nav-link" to="/logout">Logout</Link></li>}
                    </ul>
                </nav>
            </header>
        )
    }
}

function mapStatetoProps(state) {
    return {authenticated: state.user.authenticated}
}

export default connect(mapStatetoProps)(HeaderComponent)