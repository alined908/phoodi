import {GET_MEETUP_INVITES, GET_FRIEND_INVITES, ADD_GLOBAL_MESSAGE} from '../constants/action-types'
import axios from 'axios'

export const getUserFriendInvites = () => async dispatch => {
    try {
        const response = await axios.get(
            "http://localhost:8000/api/friends/invite/", {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        // console.log(response)
        dispatch({type: GET_FRIEND_INVITES, payload: response.data})
    } catch(e) {
        console.log(e)
    }
}

export const getUserMeetupInvites = () => async dispatch => {
    try {
        const response = await axios.get(
            "http://localhost:8000/api/meetups/invite/", {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        // console.log(response)
        dispatch({type: GET_MEETUP_INVITES, payload: response.data})
    } catch(e) {
        console.log(e)
    }
}

export const sendMeetupInvite = (roomURI, email) => async dispatch => {
    try {
        const response = await axios.post(
            `http://localhost:8000/api/meetups/${roomURI}/invite/`, {"email": email}, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        console.log(response)
        dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "success", message: response.data.message}})
    } catch(e) {
        dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "An error occurred."}})
    }
}

export const sendFriendInvite = (formProps) => async dispatch => {
    try {
        const response = await axios.post(
            `http://localhost:8000/api/friends/invite/`, {"email": formProps.email}, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "success", message: response.data.message}})
    } catch(e) {
        dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "User does not exist"}})
    }
}

export const respondFriendInvite = (inviteURI, status) => async dispatch => {
    try {
        const response = await axios.patch(
            `http://localhost:8000/api/friends/invite/${inviteURI}/`, {"status": status},{headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        console.log(response)
        dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "success", message: response.data.message}})
    } catch(e){
        dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "An error occurred"}})
    }
}

export const respondMeetupInvite = (roomURI, inviteURI, status) => async dispatch => {
    try {
        const response = await axios.patch(
            `http://localhost:8000/api/meetups/${roomURI}/invite/${inviteURI}/`, {"status": status},{headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        console.log(response)
        dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "success", message: response.data.message}})
    } catch(e) {
        dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "An error occurred"}})
    }
}