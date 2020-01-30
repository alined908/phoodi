import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';

class HeaderComponent extends Component {
    render(){
        return (
            <header>
                <nav className="navbar navbar-expand-md navbar-dark bg-dark">
                    <div><a href="http://localhost:3000" className="navbar-brand">Meetup</a></div>
                    <ul className="navbar-nav">
                        <li><Link className="nav-link" to="/">Home</Link></li>
                        <li><Link className="nav-link" to="/chat">Chat</Link></li>
                        {this.props.authenticated && <li><Link className="nav-link" to="/meetup">Meetup</Link></li>}
                    </ul>
                    <ul className="navbar-nav navbar-collapse justify-content-end">
                        {!this.props.authenticated && <li><Link className="nav-link" to="/login">Login</Link></li>}
                        {!this.props.authenticated  && <li><Link className="nav-link" to="/register">Register</Link></li>}
                        {this.props.authenticated  && <li><Link className="nav-link" to="/logout">Logout</Link></li>}
                    </ul>
                </nav>
            </header>
        )
    }
}

function mapStatetoProps(state) {
    return {authenticated: state.auth.authenticated}
}

export default connect(mapStatetoProps)(HeaderComponent)