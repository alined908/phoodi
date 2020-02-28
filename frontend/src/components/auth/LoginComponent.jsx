import React, {Component} from 'react';
import {reduxForm, Field} from 'redux-form';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {signin} from "../../actions/index"
import {Typography, Paper, Grid, Fab} from '@material-ui/core';
import renderTextField from '../renderTextField'

class LoginComponent extends Component {

    onSubmit = formProps => {
        this.props.signin(formProps, () => {
            this.props.history.push("/welcome")
        });
    }

    render(){
        const {handleSubmit} = this.props;

        return (
            <div className="inner-wrap">
                <div className="inner-header">
                <Typography variant="h5">Login</Typography>
                </div>
                <div className="form">
                    <Paper elevation={3} style={{padding: "2rem 3rem"}}>
                        <form onSubmit={handleSubmit(this.onSubmit)}>
                            <Grid container style={{padding: "1rem"}} spacing={3}>
                                <Grid item xs={12}>
                                    <Field name="email" component={renderTextField} label="Email"/>
                                </Grid>
                                <Grid item xs={12}>
                                    <Field name="password" type="password" component={renderTextField} label="Password"/>
                                </Grid> 
                                <Grid item xs={12}>
                                    <div>{this.props.errorMessage}</div>
                                </Grid>
                                <Grid item xs={12}>
                                <Fab type="submit" variant="extended" color="primary" aria-label="login">Login</Fab>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </div>
            </div>
        )
    }
}

function mapStatetoProps(state) {
    return {errorMessage: state.user.errorMessage}
}

const mapDispatchToProps = {
    signin
}

export default compose (
    connect(mapStatetoProps, mapDispatchToProps),
    reduxForm({form: 'signin'})
)(LoginComponent);