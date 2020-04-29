import * as types from '../constants/action-types'
import {axiosClient} from '../accounts/axiosClient'

export const getUserFriendInvites = () => async dispatch => {
    dispatch({type: types.GET_FRIEND_INVITES_REQUEST})
    try {
        const response = await axiosClient.get("/api/friends/invite/", {headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`}})
    
        dispatch({type: types.GET_FRIEND_INVITES_SUCCESS, payload: response.data})
    } catch(e) {
        dispatch({type: types.GET_FRIEND_INVITES_ERROR, payload: "Unable to get friend invites."})
    }
}

export const getUserMeetupInvites = () => async dispatch => {
    dispatch({type: types.GET_MEETUP_INVITES_REQUEST})
    try {
        const response = await axiosClient.get("/api/meetups/invite/", {headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`}})
        dispatch({type: types.GET_MEETUP_INVITES_SUCCESS, payload: response.data})
    } catch(e) {
        dispatch({type: types.GET_MEETUP_INVITES_ERROR, payload: "Unable to get meetup invites."})
    }
}

export const sendMeetupInvite = (roomURI, email) => async dispatch => {
    try {
        const response = await axiosClient.post(`/api/meetups/${roomURI}/invite/`,{email}, 
            {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            }
        )

        dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "success", message: response.data.message}})
    } catch(e) {
        dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "An error occurred."}})
    }
}

export const sendFriendInvite = (email) => async dispatch => {
    try {
        const response = await axiosClient.post(`/api/friends/invite/`, {email}, 
            {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            }
        )
        dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "success", message: response.data.message}})
    } catch(e) {
        dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "An error occurred."}})
    }
}

export const respondFriendInvite = (inviteURI, status) => async dispatch => {
    try {
        const response = await axiosClient.patch(`/api/friends/invite/${inviteURI}/`,{status},
            {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            }
        )
        
        dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "success", message: response.data.message}})
    } catch(e){
        dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "An error occurred."}})
    }
}

export const respondMeetupInvite = (roomURI, inviteURI, status) => async dispatch => {
    try {
        const response = await axiosClient.patch(`/api/meetups/${roomURI}/invite/${inviteURI}/`, {status},
            {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            }
        )
        
        dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "success", message: response.data.message}})
    } catch(e) {
        dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "An error occurred."}})
    }
}