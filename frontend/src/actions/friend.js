import {GET_FRIENDS, ADD_FRIEND, DELETE_FRIEND, FRIEND_ERROR} from '../constants/action-types'
import axios from 'axios'

export const getFriends = () => async dispatch => {
    try {
        const response = await axios.get(
            "http://localhost:8000/api/friends/", {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        // console.log(response)
        dispatch({type: GET_FRIENDS, payload: response.data})
    } catch(e){
        console.log(e);
    }
}

export const addFriend = (formProps) => async dispatch => {
    try {
        console.log(formProps)
        const response = await axios.post(
            "http://localhost:8000/api/friends/", formProps, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        console.log(response)
        dispatch({type: ADD_FRIEND, payload: response.data.friend})
    } catch(e){
        dispatch({type: FRIEND_ERROR, payload: "Email does not exist."})
        console.log(e);
    }
}

export const deleteFriend = (id) => async dispatch => {
    try {
        const response = await axios.delete(
            "http://localhost:8000/api/friends/", {"id": id}, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        console.log(response)
        dispatch({type: DELETE_FRIEND, payload: id})
    } catch(e){
        console.log(e);
    }
}
