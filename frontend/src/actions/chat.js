import {GET_ROOMS, SET_ROOM, ADD_ROOM, SET_ACTIVE_ROOM, GET_MESSAGES, SET_TYPING_VALUE, ADD_MESSAGE} from "../constants/action-types"
import axios from 'axios';

export const getRooms = () => async dispatch => {
    try {
        const response = await axios.get(
            "http://localhost:8000/api/chats/", {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        console.log(response)
        dispatch({type: GET_ROOMS, payload: response.data.rooms})
    } catch(e){
        console.log(e);
    }
}

export const setActiveRoom = (room) => async dispatch => {
    console.log("set Active room action")
    try {
        const response = await axios.get(
            `http://localhost:8000/api/chats/${room}/messages/`, {headers: {
            "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        console.log(response)
        dispatch({type: SET_ACTIVE_ROOM, payload: response.data})

    } catch(e){
        console.log(e);
    }
}

export const getMessages = (room) => async dispatch => {
    console.log("get messages action")
}

export const setTypingValue = (value) => {
    return {
        type: SET_TYPING_VALUE,
        payload: value
    }
}

export const addMessage = (value, room) => async dispatch => {
    try {
        const response = await axios.post(
            `http://localhost:8000/api/chats/${room}/messages/`, {"message": value}, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        console.log("post message")
        console.log(response)
        dispatch({type: ADD_MESSAGE, payload: response.data})
    } catch(e){
        console.log(e);
    }
}
    
// export const setRoom = () => async dispatch => {
//     try {

//     }
// }

// export const addRoom = () = async dispatch = {
//     try {

//     }
// }