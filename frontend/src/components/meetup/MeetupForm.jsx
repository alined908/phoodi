import React, {Component} from 'react';
import {connect} from 'react-redux';
import {reduxForm, Field} from 'redux-form';
import {compose} from 'redux';
import {Button, Typography, Paper, Grid, Fab} from '@material-ui/core';
import renderDatePicker from "./renderDatePicker";
import {addMeetup} from "../../actions/meetup";
import {Link} from 'react-router-dom'
import renderTextField from '../renderTextField'

class MeetupForm extends Component {

    onSubmit = (formProps) => {
        this.props.addMeetup(formProps, (uri) => {
            this.props.history.push(`/meetups/${uri}`)
        })
    }

    render (){
        const {handleSubmit} = this.props;

        return (
            <div className="inner-wrap">
                <div className="inner-header">
                    <Typography variant="h5">Create New Meetup</Typography>
                    <Link to={"/meetups"}><Button variant="contained" color="primary">Meetups</Button></Link>
                </div>
                <div className="form">
                    <Paper elevation={3} style={{padding: "2rem 3rem"}}>
                        <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                            <Grid container style={{padding: "1rem"}} spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="h6">Meetup Information</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Field name="location" component={renderTextField} label="Location"/>
                                </Grid>
                                <Grid item xs={12}>
                                    <Field name="datetime" component={renderDatePicker} label="Date/Time"></Field>
                                </Grid>
                                <Grid style={{marginTop: "1rem"}} item xs={12}>
                                    <Fab type="submit" variant="extended" color="primary" aria-label="add">Add Meetup</Fab>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </div>
            </div>
        )
    }

}

const mapDispatchToProps = {
    addMeetup
}

export default compose (
    connect(null, mapDispatchToProps),
    reduxForm({form: 'meetup'})
)(MeetupForm);