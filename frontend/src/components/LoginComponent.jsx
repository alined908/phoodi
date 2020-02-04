import React, {Component} from 'react';
import {reduxForm, Field} from 'redux-form';
import {compose} from 'redux';
import {connect} from 'react-redux';
import * as actions from '../actions';

class LoginComponent extends Component {

    onSubmit = formProps => {
        this.props.signin(formProps, () => {
            this.props.history.push("/welcome")
        });
    }

    render(){
        const {handleSubmit} = this.props;

        return (
            <div>
                <h1>Login</h1>
                <div className="container">
                    <form onSubmit={handleSubmit(this.onSubmit)}>
                        <label>Email</label>
                        <Field name="email" type="text" component="input" autoComplete="none"/>
                        <label>Password</label>
                        <Field name="password" type="password" component="input" autoComplete="none"/>
                        <div>{this.props.errorMessage}</div>
                        <button className="btn btn-success">Signin</button>
                    </form>
                </div>
            </div>
        )
    }
}

function mapStatetoProps(state) {
    return {errorMessage: state.user.errorMessage}
}

export default compose (
    connect(mapStatetoProps, actions),
    reduxForm({form: 'signin'})
)(LoginComponent);