import {GET_FRIENDS, DELETE_FRIEND, ADD_GLOBAL_MESSAGE} from '../constants/action-types'
import {axiosClient} from '../accounts/axiosClient'

export const getFriends = (id, category = null) => async dispatch => {
    try {
        const response = await axiosClient.get(
            `/api/users/${id}/friends/`, {
                params: {
                    ...category && {category}
                },
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            }
        )
        // console.log(response)
        dispatch({type: GET_FRIENDS, payload: response.data})
    } catch(e){
        console.log(e);
    }
}

export const deleteFriend = (user_id, friend_id) => async dispatch => {
    try {
        const response = await axiosClient.delete(
            `/api/users/${user_id}/friends/`, {data: {"id": friend_id}, headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }}
        )
        console.log(response)
        Promise.all([
            dispatch({type: DELETE_FRIEND, payload: response.data}), 
            dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "success", message: "Removed Friend"}})
        ])
    } catch(e){
        dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "error", message: e.message}})
    }
}
