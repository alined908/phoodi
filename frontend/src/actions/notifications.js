import {GET_NOTIFS, REMOVE_NOTIFS} from "../constants/action-types"
import {axiosClient} from "../accounts/axiosClient";

export const getNumberNotifs = (event) => async dispatch => {
    console.log(event.message)
    dispatch({type: GET_NOTIFS, payload: event.message})
}

export const removeNotifs = (data) => async dispatch => {
    console.log(data)
    try {
        const response = await axiosClient.delete(
            '/api/notifs/', {data: data, headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        console.log(response)
        dispatch({type: REMOVE_NOTIFS, payload: response.data})
    } catch(e){
        console.log(e)
    }
}