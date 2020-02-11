import React, { Component } from 'react'
import {reduxForm, Field} from 'redux-form';
import renderDatePicker from "./renderDatePicker"
import {Button, TextField} from '@material-ui/core';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {addMeetupEvent} from "../../actions/meetup"
import axios from "axios"
import Category from "./Category"

class MeetupEventForm extends Component {
    constructor(props){
        super(props)
        this.state = {
            categories: [],
            entries: {}
        }
    }

    componentDidMount(){
        if (localStorage.getItem("categories") === null) {
            axios.get("http://localhost:8000/api/categories/")
            .then((response) =>
                localStorage.setItem("categories", JSON.stringify(response.data)
            )
        )      
        } 
        
        this.setState({
            categories: JSON.parse(localStorage.getItem('categories')).categories
        })
    }

    onSubmit = (formProps) => {
        this.props.addMeetupEvent(this.props.match.params.uri, formProps, this.state.entries, (uri) => {
            this.props.history.push(`/meetups/${uri}`)
        })
    }

    render () {
        const {handleSubmit} = this.props;
        
        const renderTextField = ({ input, label, meta: { touched, error }, ...custom }) => (
            <TextField label={label}
              {...input}
              {...custom}
            />
        )

        const handleClick = (api_label, id) => {
            var entries = this.state.entries
            if (api_label in entries) {
                delete entries[api_label]
            } else {
                entries[api_label] = id
            }
            this.setState({
                entries: entries
            })
        }

        return (
            <div>
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                    <Field name="title" component={renderTextField} label="title"></Field>
                    <Field name="location" component={renderTextField} label="location"></Field>
                    <Field name="start" component={renderDatePicker} label="start"></Field>
                    <Field name="end" component={renderDatePicker} label="end"></Field>
                    <Button type="submit" variant="contained" color="primary">Add Event</Button>
                </form>
              
                {this.state.categories.map((category) => 
                    <div onClick={() => handleClick(category.api_label, category.id)}>
                        <Category key={category.id} category={category}></Category>
                    </div>
                )}
            </div>
        )
    }
}


const mapDispatchToProps = {
    addMeetupEvent,
}

export default compose (
    connect(null, mapDispatchToProps),
    reduxForm({form: 'event'})
)(MeetupEventForm);