import {GET_ROOMS, SET_ACTIVE_ROOM, GET_MESSAGES, GET_MORE_MESSAGES, SET_TYPING_VALUE, ADD_MESSAGE, REMOVE_ACTIVE_ROOM} from "../constants/action-types"
import {axiosClient} from '../accounts/axiosClient'

export const getRooms = () => async dispatch => {
    try {
        const response = await axiosClient.get(
            "/api/chats/", {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        console.log(response)
        dispatch({type: GET_ROOMS, payload: response.data.rooms})
    } catch(e){
        console.log(e);
    }
}

export const setActiveRoom = (room) => {
    console.log("set Active room action")
    return {
        type: SET_ACTIVE_ROOM,
        payload: {"uri": room}
    }
}

export const removeActiveRoom = () => {
    return {
        type: REMOVE_ACTIVE_ROOM
    }
}

export const getMessages = (room) => async dispatch => {
    console.log("get messages action")
    try {
        const response = await axiosClient.get(
            `/api/chats/${room}/messages/`, {headers: {
            "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        console.log(response)
        dispatch({type: GET_MESSAGES, payload: response.data})
    } catch(e){
        console.log(e);
    }
}

export const getMoreMessages = (room, last_message_id) => async dispatch => {
    console.log("get more messages")
    try {
        const response = await axiosClient.get(
            `/api/chats/${room}/messages/`, {params: {last: last_message_id}, headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        dispatch({type: GET_MORE_MESSAGES, payload: response.data})
    } catch(e){
        console.log(e)
    }

}

export const setTypingValue = (value) => {
    return {
        type: SET_TYPING_VALUE,
        payload: value
    }
}

export const addMessage = (message) => async dispatch => {
    try {
        console.log(message);
        dispatch({type: ADD_MESSAGE, payload: {"message": message}})
    } catch(e){
        console.log(e);
    }
}