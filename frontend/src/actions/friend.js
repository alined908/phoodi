import {GET_FRIENDS, DELETE_FRIEND} from '../constants/action-types'
import axios from 'axios'

export const getFriends = (id) => async dispatch => {
    try {
        const response = await axios.get(
            `/api/users/${id}/friends/`, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
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
        const response = await axios.delete(
            "/api/friends/", {"id": id}, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        console.log(response)
        dispatch({type: DELETE_FRIEND, payload: id})
    } catch(e){
        console.log(e);
    }
}
