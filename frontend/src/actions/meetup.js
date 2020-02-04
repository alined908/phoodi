import {GET_MEETUPS, ADD_MEETUP, DELETE_MEETUP} from "../constants/action-types";
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
    console.log("getMeetup called")
    try {
        const response = await axios.get(
            `http://localhost:8000/api/meetups/${uri}/`, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        console.log(response)
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
