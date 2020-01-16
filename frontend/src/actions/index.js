import {AUTH_USER, AUTH_ERROR} from "../constants/action-types"
import axios from 'axios';
import AuthenticationService from "../accounts/AuthenticationService";

export const signup = (formProps, redirectOnSuccess) => async dispatch => {
    try {
        const response = await axios.post('http://localhost:8000/api/users/', {
            "user": formProps
        })
        console.log(response)
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
        payload: {"token": '', "user": {}}
    }
}

export const signin = (formProps, redirectOnSuccess) => async dispatch => {
    try {
        const response = await axios.post('http://localhost:8000/api/token-auth/', formProps)
        dispatch({type: AUTH_USER, payload: response.data});
        AuthenticationService.registerSuccessfulLogin(response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user[Object.keys(response.data.user)[0]]))
        redirectOnSuccess();
    }
    catch (e){
        console.log("error signin");
        dispatch({type: AUTH_ERROR, payload: "Invalid login credentials"})
    }
}
