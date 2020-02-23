import {GET_MEETUPS, ADD_MEETUP, DELETE_MEETUP, SEND_MEETUP_EMAILS, VOTE_MEETUP_EVENT, GET_MEETUP_EVENTS, DELETE_MEETUP_EVENT, ADD_MEETUP_EVENT, EDIT_MEETUP_EVENT} from "../constants/action-types";
import axios from 'axios';
import {history} from '../components/MeetupApp'

export const getMeetups = () => async dispatch => {
    try {
        const response = await axios.get(
            "http://localhost:8000/api/meetups/", {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        dispatch({type: GET_MEETUPS, payload: response.data.meetups})
    } catch(e){
        console.log(e)
    }
}

export const getMeetup = (uri) => async dispatch => {
    try {
        const response = await axios.get(
            `http://localhost:8000/api/meetups/${uri}/`, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        // console.log(response)
        dispatch({type: ADD_MEETUP, payload: response.data})
    } catch(e){
        console.log(e)
    }
}

export const addMeetup = (formProps, redirectOnSuccess) => async dispatch => {
    console.log("add meetup called")
    console.log(formProps);
    try {
        const response = await axios.post(
            `http://localhost:8000/api/meetups/`, formProps, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        dispatch({type: ADD_MEETUP, payload: response.data.meetup})
        console.log(response.data)
        redirectOnSuccess(response.data.meetup.uri)
    } catch(e){
        console.log(e)
    }
} 

export const deleteMeetup = (uri) => async dispatch => {
    try {
        const response = await axios.delete(
            `http://localhost:8000/api/meetups/${uri}/`, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        console.log(response)
        dispatch({type: DELETE_MEETUP, payload: uri})
        history.push(`/meetups`)
    } catch(e) {
        console.log(e)
    }
}

export const getMeetupEvents = (uri) => async dispatch => {
    try {
        const response = await axios.get(
            `http://localhost:8000/api/meetups/${uri}/events/`, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        // console.log(response)
        dispatch({type: GET_MEETUP_EVENTS, payload: {uri: uri, data: response.data}})
    } catch(e) {
        console.log(e)
    }
}

export const addMeetupEvent = (event) => async dispatch => {
    dispatch({type: ADD_MEETUP_EVENT, payload: event.message})
    history.push(`/meetups/${event.message.meetup}`)
}

export const deleteMeetupEvent = (event) => async dispatch => {
    dispatch({type: DELETE_MEETUP_EVENT, payload: event.message})
}

export const reloadMeetupEvent = (event) => async dispatch => {
    dispatch({type: EDIT_MEETUP_EVENT, payload: event.message})
}

export const voteMeetupEvent = (event) => async dispatch => {
    dispatch({type: VOTE_MEETUP_EVENT, payload: event.message})
}
    
export const decideMeetupEvent = (event) => async dispatch => {
    dispatch({type: EDIT_MEETUP_EVENT, payload: event.message})
}

export const sendMeetupEmails = (uri) => async dispatch => {
    try {
        const response = await axios.post(
            `http://localhost:8000/api/meetups/${uri}/email`, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        console.log(response)
       // dispatch({type: SEND_MEETUP_EMAILS, payload: {uri: uri, data: response.data}})
    } catch(e) {
        console.log(e)
    }
}