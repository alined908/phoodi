import {AUTH_USER, AUTH_ERROR} from "./types"
import axios from 'axios';
import AuthenticationService from "../accounts/AuthenticationService";

export const signup = (formProps, redirectOnSuccess) => async dispatch => {
    try {
        const response = await axios.post('http://localhost:8000/meetup/users/create', {
            "user": formProps
        })
        console.log(response)
        dispatch({type: AUTH_USER, payload: response.data.user.token});
        AuthenticationService.registerSuccessfulLogin(response.data.user.token)
        redirectOnSuccess();
    }
    catch (e){
        console.log("error");
        dispatch({type: AUTH_ERROR, payload: "Email in use"})
    }
}

export const signout = () => {
    localStorage.removeItem('token')
    return {
        type: AUTH_USER,
        payload: ''
    }
}

export const signin = (formProps, redirectOnSuccess) => async dispatch => {
    try {
        console.log(formProps);
        const response = await axios.post('http://localhost:8000/token-auth/', formProps)
        console.log(response)
        dispatch({type: AUTH_USER, payload: response.data.token});
        AuthenticationService.registerSuccessfulLogin(response.data.token)
        redirectOnSuccess();
    }
    catch (e){
        console.log("error signin");
        dispatch({type: AUTH_ERROR, payload: "Invalid login credentials"})
    }
}
