import React, {Component} from 'react';
import AuthenticationService from "../accounts/AuthenticationService.js";
import axios from 'axios';

class LoginComponent extends Component {

    constructor(props){
        super(props)
        this.state = {
            email: '',
            password: '',
            hasLoginFailed: false,
            showSuccessMessage: false
        }
        this.handleChange = this.handleChange.bind(this);
        this.loginClicked = this.loginClicked.bind(this);
    }

    handleChange(event){
        this.setState({
            [event.target.name]:event.target.value
        })
    }

    loginClicked(){
        axios.post('http://localhost:8000/token-auth/', {
            email: this.state.email,
            password: this.state.password
        })
        .then(response => {
            if (response.status === 200) {
                AuthenticationService.registerSuccessfulLogin(response.token);
                this.props.history.push("/welcome")
            }
        })
        .catch(error => {
            this.setState({showSuccessMessage: false})
            this.setState({hasLoginFailed: true})
        })
    }

    render () {
        return (
            <div>
                <h1>Login</h1>
                <div className="container">
                    {this.state.hasLoginFailed && <div className="alert alert-warning">Invalid Credentials</div>}
                    {this.state.showSuccessMessage && <div>Logged in Successfully</div>}
                    Email: <input type="email" name="email" value={this.state.email} onChange={this.handleChange}></input>
                    Password: <input type="password" name="password" value={this.state.password} onChange={this.handleChange}></input>
                    <button className="btn btn-success" onClick={this.loginClicked}>Login</button>
                </div>
            </div>
        )
    }
}

export default LoginComponent