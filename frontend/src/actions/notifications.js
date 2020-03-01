import {GET_NOTIFS, REMOVE_NOTIFS} from "../constants/action-types"
import axios from "axios";

export const getNumberNotifs = (event) => async dispatch => {
    dispatch({type: GET_NOTIFS, payload: event.message})
}

export const removeNotifs = (data) => async dispatch => {
    try {
        const response = await axios.delete(
            'http://localhost:8000/api/notifs/', data, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        console.log(response)
        dispatch({type: REMOVE_NOTIFS, payload: response.data})
    } catch(e){
        console.log(e)
    }
}