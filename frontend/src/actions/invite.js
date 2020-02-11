import {GET_MEETUP_INVITES, SEND_MEETUP_INVITE, RESPOND_MEETUP_INVITE, GET_FRIEND_INVITES, SEND_FRIEND_INVITE, RESPOND_FRIEND_INVITE} from '../constants/action-types'
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

// export const getRoomInvites = (roomURI) => async dispatch => {
//     try {
//         const response = await axios.get(
//             "http://localhost:8000/api/chats/", {headers: {
//                 "Authorization": `JWT ${localStorage.getItem('token')}`
//             }}
//         )
//         console.log(response)
//         dispatch({type: GET_MEETUP_INVITES, action: response.data})
//     } catch(e) {
//         console.log(e)
//     }
// }

export const sendMeetupInvite = (roomURI, email) => async dispatch => {
    try {
        console.log(email)
        const response = await axios.post(
            `http://localhost:8000/api/meetups/${roomURI}/invite/`, {"email": email}, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        console.log(response)
        dispatch({type: SEND_MEETUP_INVITE, payload: response.data})
    } catch(e) {
        console.log(e)
    }
}

export const sendFriendInvite = (formProps) => async dispatch => {
    console.log(formProps)
    try {
        const response = await axios.post(
            `http://localhost:8000/api/friends/invite/`, {"email": formProps.email}, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        console.log(response)
        dispatch({type: SEND_FRIEND_INVITE, payload: response.data})
    } catch(e) {
        console.log(e)
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
        dispatch({type: RESPOND_FRIEND_INVITE, payload: response.data})
    } catch(e){
        console.log(e)
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
        dispatch({type: RESPOND_MEETUP_INVITE, payload: response.data})
    } catch(e) {
        console.log(e)
    }
}