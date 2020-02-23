import React, {Component} from 'react';
import {connect} from 'react-redux';
import {reduxForm, Field} from 'redux-form';
import {compose} from 'redux';
import {Button, TextField} from '@material-ui/core';
import renderDatePicker from "./renderDatePicker";
import {addMeetup} from "../../actions/meetup";

class MeetupForm extends Component {

    onSubmit = (formProps) => {
        this.props.addMeetup(formProps, (uri) => {
            this.props.history.push(`/meetups/${uri}`)
        })
    }

    render (){
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
                <Button type="submit" variant="contained" color="primary">Add Meetup</Button>
            </form>)
        }

        return (
            <div className="inner-wrap form">{meetupForm()}</div>
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