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

export const addMeetup = (meetup) => async dispatch => {
    try {
        const response = await axios.post(
            `http://localhost:8000/api/meetups/`, {"meetup": meetup}, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        dispatch({type: ADD_MEETUP, payload: response.data})
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
