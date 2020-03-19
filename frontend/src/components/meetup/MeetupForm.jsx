import React, {Component} from 'react';
import {connect} from 'react-redux';
import {reduxForm, Field} from 'redux-form';
import {compose} from 'redux';
import {Button, Typography, Paper, Grid, Fab} from '@material-ui/core';
import {addMeetup, editMeetup, getMeetup} from "../../actions/meetup";
import {Link} from 'react-router-dom'
import {renderTextField, renderDateSimplePicker, Location} from '../components'
import moment from "moment"

class MeetupForm extends Component {
    constructor(props){
        super(props)
        this.state = {
            location: ""
        }
        this.handleClick = this.handleClick.bind(this)
    }

    componentDidMount() {
        if (!this.props.isMeetupInitialized && this.props.type === "edit") {
            this.props.getMeetup(this.props.match.params.uri)
        }
    }

    onSubmit = (formProps) => {
        let data = {...formProps, location: this.state.location}

        if (this.props.type === "create") {
            this.props.addMeetup(data, (uri) => {
                this.props.history.push(`/meetups/${uri}`)
            })
        }
        
        if (this.props.type === "edit"){
            this.props.editMeetup(data, this.props.meetup.uri, (uri) => [
                this.props.history.push(`/meetups/${uri}`)
            ])
        }
    }

    handleClick = (e, value) => {
        let location;
        if (value === null){
            location = ""
        } else {
            location = value.description
        }
        this.setState({location})
    }



    render (){
        const {handleSubmit} = this.props;
        const create = this.props.type === "create"

        return (
            <div className="inner-wrap">
                <div className="inner-header">
                    <Typography variant="h5">{create ? "Create Meetup" : "Edit Meetup"}</Typography>
                    {create ? <Link to={"/meetups"}>
                        <Button variant="contained" color="primary">Meetups</Button>
                        </Link> :
                    
                    <Link to={`/meetups/${this.props.match.params.uri}`}><Button variant="contained" color="primary">Meetup</Button></Link>}
                    
                </div>
                <div className="form">
                    <Paper elevation={3} className="form-paper">
                        <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                            <Grid container style={{padding: "1rem"}} spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="h6">Meetup Information</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Field name="name" component={renderTextField} label="Name"/>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Location label="Location" handleClick={this.handleClick}/>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Field name="date" component={renderDateSimplePicker} disabled={this.props.isMeetupInitialized && moment(this.props.meetup.date).add(1, "d").isBefore(moment().toDate())} label="Date"></Field>
                                </Grid>
                                <Grid style={{marginTop: "1rem"}} xs={12}>
                                    <Fab type="submit" variant="extended" color="primary" aria-label="add">{create ? "Add Meetup" : "Edit Meetup"}</Fab>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </div>
            </div>
        )
    }

}

function mapStateToProps(state, ownProps){
    if (ownProps.type === "edit" && (ownProps.match.params.uri in state.meetup.meetups)){
        const meetup = state.meetup.meetups[ownProps.match.params.uri]
        return {
            initialValues: {name: meetup.name, date: moment(meetup.date).add(1, 'days').format('YYYY-MM-DD'), location: meetup.location},
            meetup: meetup,
            isMeetupInitialized: true
        }
    } else {
        return {
            initialValues: {date: new Date()},
            isMeetupInitialized: false
        }
    }
    
}

const mapDispatchToProps = {
    addMeetup,
    editMeetup,
    getMeetup
}

export default compose (
    connect(mapStateToProps, mapDispatchToProps),
    reduxForm({form: 'meetup'})
)(MeetupForm);