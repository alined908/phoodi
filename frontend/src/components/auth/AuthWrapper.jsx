import React, {Component} from 'react'
import {Dialog} from '@material-ui/core'
import {LoginPage} from '../components'
import {withRouter} from 'react-router-dom'

class AuthWrapper extends Component {

    constructor(props){
        super(props);
        this.state = {
            loginForm: false
        }
    }

    handleClick = event => {
        this.setState({loginForm: true})
    }

    handleClose = event => {
        event.stopPropagation();
        this.setState({loginForm: false})
    }

    render = () => {

        return (
            <div className="auth-wrapper" onClick={this.props.authenticated ? undefined : this.handleClick}>
                <div className={`${!this.props.authenticated && 'block'}`}>
                    {this.props.children}
                </div>
                <Dialog className='auth-alert' open={this.state.loginForm} fullWidth={true} onClose={this.handleClose}>
                    <LoginPage {...this.props}/>
                </Dialog>
            </div>
        )
    }
}

export default withRouter(AuthWrapper)