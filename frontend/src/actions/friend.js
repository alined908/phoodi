import {GET_FRIENDS, DELETE_FRIEND} from '../constants/action-types'
import {axiosClient} from '../accounts/axiosClient'

export const getFriends = (id) => async dispatch => {
    try {
        const response = await axiosClient.get(
            `/api/users/${id}/friends/`, {headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }}
        )
        // console.log(response)
        dispatch({type: GET_FRIENDS, payload: response.data})
    } catch(e){
        console.log(e);
    }
}

export const deleteFriend = (id) => async dispatch => {
    try {
        const response = await axiosClient.delete(
            "/api/friends/", {"id": id}, {headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }}
        )
        console.log(response)
        dispatch({type: DELETE_FRIEND, payload: id})
    } catch(e){
        console.log(e);
    }
}
