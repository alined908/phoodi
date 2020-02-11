import {GET_MEETUPS, ADD_MEETUP, DELETE_MEETUP, GET_MEETUP_EVENTS, DELETE_MEETUP_EVENT, ADD_MEETUP_EVENT, GET_CATEGORIES} from "../constants/action-types";
import axios from 'axios';

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

export const addMeetupEvent = (uri, formProps, categories, redirectOnSuccess) => async dispatch => {
    try {
        const response = await axios.post(
            `http://localhost:8000/api/meetups/${uri}/events/`, {...formProps, "categories": categories},{headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        console.log(response)
        dispatch({type: ADD_MEETUP_EVENT, payload: response.data})
        redirectOnSuccess(uri)
    } catch(e) {
        console.log(e)
    }
}

export const deleteMeetupEvent = (uri, id) => async dispatch => {
    try {
        const response = await axios.delete(
            `http://localhost:8000/api/meetups/${uri}/events/${id}/`, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        console.log(response)
        dispatch({type: DELETE_MEETUP_EVENT, payload: {uri: uri, id: id}})
    } catch(e){
        console.log(e)
    }
}