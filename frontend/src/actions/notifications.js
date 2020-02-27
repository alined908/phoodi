import {GET_NOTIFS, REMOVE_CHAT_NOTIFS} from "../constants/action-types"
import axios from "axios";

export const getNumberNotifs = (event) => async dispatch => {
    dispatch({type: GET_NOTIFS, payload: event.message})
}

export const removeNotifs = (uri) => async dispatch => {
    try {
        const response = await axios.delete(
            `http://localhost:8000/api/chats/${uri}/notifs/`, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        console.log(response)
        dispatch({type: REMOVE_CHAT_NOTIFS, payload: uri})
    } catch(e){
        console.log(e)
    }
}