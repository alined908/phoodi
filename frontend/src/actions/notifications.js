import {GET_NOTIFS, REMOVE_NOTIFS} from "../constants/action-types"
import axios from "axios";

export const getNumberNotifs = (event) => async dispatch => {
    dispatch({type: GET_NOTIFS, payload: event.message})
}

export const removeNotifs = (data) => async dispatch => {
    console.log(data)
    try {
        const response = await axios.delete(
            'http://localhost:8000/api/notifs/', {data: data, headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        console.log(response)
        dispatch({type: REMOVE_NOTIFS, payload: response.data})
    } catch(e){
        console.log(e)
    }
}