import {AUTH_USER, AUTH_ERROR, CLEAR_STORE, EDIT_USER} from "../constants/action-types"
import axios from 'axios';
import AuthenticationService from "../accounts/AuthenticationService";
import {history} from '../components/MeetupApp'

export const signup = (formProps, redirectOnSuccess) => async dispatch => {
    try {
        const response = await axios.post('/api/users/', 
            formProps, {headers: {"Content-Type": 'multipart/form-data'
        }})
        AuthenticationService.registerSuccessfulLogin(response.data.token, response.data.expiration)
        console.log(response)
        localStorage.setItem("user", JSON.stringify(response.data.user[Object.keys(response.data.user)[0]]))
        dispatch({type: AUTH_USER, payload: response.data});
        redirectOnSuccess();
    }
    catch (e){
        console.log(e);
        dispatch({type: AUTH_ERROR, payload: "Email in use"})
    }
}

export const signout = () => async dispatch => {
    localStorage.removeItem('token')
    // localStorage.removeItem('expiration')
    dispatch({type: CLEAR_STORE,payload: {}})
    history.push('/')
}

export const signin = (formProps, redirectOnSuccess) => async dispatch => {
    try {
        const response = await axios.post('/api/token-auth/', formProps)
        console.log(response.data)
        AuthenticationService.registerSuccessfulLogin(response.data.token,)
        localStorage.setItem("user", JSON.stringify(response.data.user[Object.keys(response.data.user)[0]]))
        // const response2 = await axios.post(`/api/token-refresh/`, {"token": AuthenticationService.retrieveToken()})
        // localStorage.setItem("refresh", response2.data.token)
        // console.log(response2.data)
        dispatch({type: AUTH_USER, payload: response.data});
        redirectOnSuccess();
    }
    catch (e){
        console.log("error signin");
        dispatch({type: AUTH_ERROR, payload: "Invalid login credentials"})
    }
}

export const getProfile = (id) => {
    try {
        const response = axios.get(`/api/users/${id}/`)
        return response.data
    } catch(e){
        console.log(e)
    }
}

export const editUser = (formProps, user_id, redirectOnSuccess) => async dispatch => {
    try {
        const response = await axios.patch(`/api/users/${user_id}/`, formProps, {headers: {
            "Authorization": `JWT ${localStorage.getItem('token')}`, "Content-Type": 'multipart/form-data'
        }})
        console.log(response.data)
        localStorage.setItem("user", JSON.stringify(response.data))
        dispatch({type: EDIT_USER, payload: response.data})
        redirectOnSuccess()
    } catch (e) {
        console.log(e)
    }
}