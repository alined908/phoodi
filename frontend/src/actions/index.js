import {AUTH_USER, AUTH_ERROR, CLEAR_STORE} from "../constants/action-types"
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
        type: CLEAR_STORE,
        payload: {}
    }
}

export const signin = (formProps, redirectOnSuccess) => async dispatch => {
    try {
        const response = await axios.post('http://localhost:8000/api/token-auth/', formProps)
        //Combine next two lines later
        AuthenticationService.registerSuccessfulLogin(response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user[Object.keys(response.data.user)[0]]))
        dispatch({type: AUTH_USER, payload: response.data});
        redirectOnSuccess();
    }
    catch (e){
        console.log("error signin");
        dispatch({type: AUTH_ERROR, payload: "Invalid login credentials"})
    }
}
