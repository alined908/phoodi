import React, {Component} from 'react';
import {connect} from 'react-redux';
import {signout} from "../../actions";
import PropTypes from "prop-types"

class LogoutComponent extends Component {
    componentDidMount(){
        this.props.signout(() => {
            this.props.history.push("/login")
        });
    }

    render () {
        return (
            <>
                <h1>You are logged out</h1>
                <div>
                    Thank you for using our application
                </div>
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