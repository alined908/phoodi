import React, {Component} from 'react';
import {Link} from 'react-router-dom';

class WelcomeComponent extends Component {
    render () {
        return (
            <div>Welcome in . <Link to="/meetup">Meetup</Link></div>
        )
    }
}

export default WelcomeComponent