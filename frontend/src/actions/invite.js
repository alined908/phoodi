import {GET_MEETUP_INVITES, GET_FRIEND_INVITES, ADD_GLOBAL_MESSAGE} from '../constants/action-types'
import {axiosClient} from '../accounts/axiosClient'

export const getUserFriendInvites = () => async dispatch => {
    try {
        const response = await axiosClient.get(
            "/api/friends/invite/", {headers: {
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
        const response = await axiosClient.get(
            "/api/meetups/invite/", {headers: {
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
        const response = await axiosClient.post(
            `/api/meetups/${roomURI}/invite/`, {"email": email}, {headers: {
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
        const response = await axiosClient.post(
            `/api/friends/invite/`, {"email": formProps.email}, {headers: {
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
        const response = await axiosClient.patch(
            `/api/friends/invite/${inviteURI}/`, {"status": status},{headers: {
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
        const response = await axiosClient.patch(
            `/api/meetups/${roomURI}/invite/${inviteURI}/`, {"status": status},{headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        console.log(response)
        dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "success", message: response.data.message}})
    } catch(e) {
        dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "An error occurred"}})
    }
}