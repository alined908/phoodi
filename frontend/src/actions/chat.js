import * as types from "../constants/action-types"
import {axiosClient} from '../accounts/axiosClient'

export const getRoom = (uri) => async dispatch => {
    dispatch({type: types.GET_ROOMS_REQUEST})
    try {
        const response = await axiosClient.get(
            `/api/chats/${uri}/`, {headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }}
        )
        dispatch({type: types.GET_ROOMS_SUCCESS, payload: response.data})
    } catch(e){
        dispatch({type: types.GET_ROOMS_ERROR, payload: "Unable to get chat room."})
    }
}   

export const getRooms = () => async dispatch => {
    dispatch({type: types.GET_ROOMS_REQUEST})
    try {
        const response = await axiosClient.get(
            "/api/chats/", {headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }}
        )
        dispatch({type: types.GET_ROOMS_SUCCESS, payload: response.data})
    } catch(e){
        dispatch({type: types.GET_ROOMS_ERROR, payload: "Unable to get chat rooms."})
    }
}

export const getMessages = (room) => async dispatch => {
    dispatch({type: types.GET_MESSAGES_REQUEST})
    try {
        const response = await axiosClient.get(
            `/api/chats/${room}/messages/`, {headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
        }})
        dispatch({type: types.GET_MESSAGES_SUCCESS, payload: response.data})
    } catch(e){
        dispatch({type: types.GET_MESSAGES_ERROR, payload: "Unable to get messages."})
    }
}

export const getMoreMessages = (room, last_message_id) => async dispatch => {
    dispatch({type: types.GET_MORE_MESSAGES_REQUEST})
    try {
        const response = await axiosClient.get(
            `/api/chats/${room}/messages/`, {params: {last: last_message_id}, headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
        }})
        dispatch({type: types.GET_MORE_MESSAGES_SUCCESS, payload: response.data})
    } catch(e){
        dispatch({type: types.GET_MORE_MESSAGES_ERROR, payload: "Unable to get more messages."})
    }

}

export const setActiveRoom = (room) => {
    return {
        type: types.SET_ACTIVE_ROOM,
        payload: {"uri": room}
    }
}

export const removeActiveRoom = () => {
    return {type: types.REMOVE_ACTIVE_ROOM}
}

export const updateRoom = (event) => async dispatch => {
    dispatch({type: types.UPDATE_ROOM, payload: event.message})
}

export const setTypingValue = (value) => {
    return {
        type: types.SET_TYPING_VALUE,
        payload: value
    }
}

export const addMessage = (message) => async dispatch => {
    dispatch({type: types.ADD_MESSAGE, payload: {message}})    
}