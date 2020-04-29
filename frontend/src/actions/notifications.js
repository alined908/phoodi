import {GET_NOTIFS, REMOVE_NOTIFS} from "../constants/action-types"
import {axiosClient} from "../accounts/axiosClient";

export const getNumberNotifs = event =>  {
    // console.log(event.message)
    return {
        type: GET_NOTIFS, 
        payload: event.message
    }
}

export const removeNotifs = (data) => async dispatch => {
    try {
        const response = await axiosClient.delete('/api/notifs/', {data: data, headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }}
        )
        dispatch({type: REMOVE_NOTIFS, payload: response.data})
    } catch(e){
        console.log(e)
    }
}