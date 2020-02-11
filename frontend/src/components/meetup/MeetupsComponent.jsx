import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getMeetups, addMeetup} from "../../actions/meetup";
import {reduxForm, Field} from 'redux-form';
import {compose} from 'redux';
import {Button, TextField} from '@material-ui/core';
import renderDatePicker from "./renderDatePicker";
import MeetupCard from "./MeetupCard"

class MeetupsComponent extends Component {
    componentDidMount(){
        this.props.getMeetups();
    }

    onSubmit = (formProps) => {
        this.props.addMeetup(formProps, (uri) => {
            this.props.history.push(`/meetups/${uri}`)
        })
    }

    render(){
        const {handleSubmit} = this.props;

        const renderTextField = ({ input, label, meta: { touched, error }, ...custom }) => (
            <TextField label={label}
              {...input}
              {...custom}
            />
        )

        const meetupForm = () => {
            return (<form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                <Field name="location" component={renderTextField} label="location"/>
                <Field name="datetime" component={renderDatePicker} label="Date + Time"></Field>
                {/* <div>{this.props.errorMessage}</div> */}
                <Button type="submit" variant="contained" color="primary">Add Meetup</Button>
            </form>)
        }

        return (
            <div>
                {!this.props.isMeetupsInitialized && <div>Initializing Meetups ....</div>}
                {this.props.isMeetupsInitialized && meetupForm()}
                {this.props.isMeetupsInitialized && this.props.meetups.map((meetup) => 
                    // <Meetup key={meetup.id} meetup={Object.values(meetup)}></Meetup>
                    <MeetupCard key={meetup.id} meetup={meetup}></MeetupCard>
                )}
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        isMeetupsInitialized: state.meetup.isMeetupsInitialized,
        meetups: Object.values(state.meetup.meetups),
        // errorMessage: state.meetup.errorMessage
    }
}

const mapDispatchToProps = {
    getMeetups,
    addMeetup
}

export default compose (
    connect(mapStateToProps, mapDispatchToProps),
    reduxForm({form: 'meetup'})
)(MeetupsComponent);