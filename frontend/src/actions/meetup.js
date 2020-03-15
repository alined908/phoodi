import {GET_MEETUPS, ADD_MEETUP, ADD_MEETUP_MEMBER, ADD_GLOBAL_MESSAGE, DELETE_MEETUP, EDIT_MEETUP, VOTE_MEETUP_EVENT, GET_MEETUP_EVENTS, DELETE_MEETUP_EVENT, ADD_MEETUP_EVENT, EDIT_MEETUP_EVENT} from "../constants/action-types";
import axios from 'axios';
import {history} from '../components/MeetupApp'

export const getMeetups = () => async dispatch => {
    try {
        const response = await axios.get(
            "/api/meetups/", {headers: {
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
            `/api/meetups/${uri}/`, {headers: {
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
    var params = {...formProps, 
        date: formProps.date.getFullYear()+ "-" + ("0"+(formProps.date.getMonth()+1)).slice(-2) + "-" + ("0" + formProps.date.getDate()).slice(-2)
    }
    try {
        const response = await axios.post(
            `/api/meetups/`, params, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        dispatch({type: ADD_MEETUP, payload: response.data.meetup})
        console.log(response.data)
        redirectOnSuccess(response.data.meetup.uri)
    } catch(e){
        console.log(e)
    }
} 

export const editMeetup = (formProps, uri, redirectOnSuccess) => async dispatch => {
    console.log('edit meetup')
    var date = new Date(formProps.date)
    var params = {...formProps, 
        date: date.getFullYear()+ "-" + ("0"+(date.getMonth()+1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2)
    }
    try {
        const response = await axios.patch(
            `/api/meetups/${uri}/`, params, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        dispatch({type: EDIT_MEETUP, payload: response.data})
        console.log(response.data)
        redirectOnSuccess(uri)
    } catch(e){
        console.log(e)
    }
}

export const deleteMeetup = (uri) => async dispatch => {
    try {
        const response = await axios.delete(
            `/api/meetups/${uri}/`, {headers: {
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
            `/api/meetups/${uri}/events/`, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        console.log(response)
        dispatch({type: GET_MEETUP_EVENTS, payload: {uri: uri, data: response.data}})
    } catch(e) {
        console.log(e)
    }
}

export const addMeetupEvent = (event) => async dispatch => {
    dispatch({type: ADD_MEETUP_EVENT, payload: event.message})
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

export const addMeetupMember = (event) => async dispatch => {
    dispatch({type: ADD_MEETUP_MEMBER, payload: event.message})
}

export const sendMeetupEmails = (uri) => async dispatch => {

    try {
        await axios.post(
            `/api/meetups/${uri}/email/`, {}, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "success", message: "Successfully sent emails"}})
    } catch(e) {
        dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "Unable to send emails"}})
    }
}