import React, {Component} from 'react';
import {connect} from 'react-redux';
import {signout} from "../../actions/index";
import PropTypes from "prop-types"

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

LogoutComponent.propTypes = {
    signout: PropTypes.func.isRequired
}

const mapDispatchToProps = {
    signout
}

export default connect(null, mapDispatchToProps)(LogoutComponent);