import {AUTH_USER, AUTH_ERROR, CLEAR_STORE, EDIT_USER, ADD_GLOBAL_MESSAGE, GET_PREFERENCES, REORDER_PREFERENCES, ADD_PREFERENCE, DELETE_PREFERENCE, EDIT_PREFERENCE} from "../constants/action-types"
import {axiosClient} from '../accounts/axiosClient'
import AuthenticationService from "../accounts/AuthenticationService";
import {history} from '../components/MeetupApp'

export const signup = (formProps, redirectOnSuccess) => async dispatch => {
    try {
        const response = await axiosClient.post('/api/users/', 
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
        const response = await axiosClient.post('/api/token-auth/', formProps)
        console.log(response.data)
        AuthenticationService.registerSuccessfulLogin(response.data.token,)
        localStorage.setItem("user", JSON.stringify(response.data.user[Object.keys(response.data.user)[0]]))
        // const response2 = await axiosClient.post(`/api/token-refresh/`, {"token": AuthenticationService.retrieveToken()})
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
        const response = axiosClient.get(`/api/users/${id}/`)
        return response.data
    } catch(e){
        console.log(e)
    }
}

export const editUser = (formProps, user_id, redirectOnSuccess) => async dispatch => {
    try {
        const response = await axiosClient.patch(`/api/users/${user_id}/`, formProps, {headers: {
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

export const getPreferences = (user_id) => async dispatch => {
    try {
        const response = await axiosClient.get(`/api/users/${user_id}/preferences/`, {headers: {
            "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        console.log(response.data)
        dispatch({type: GET_PREFERENCES, payload: response.data})
    } catch(e) {
        console.log(e)
        dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "Unable to get preference."}})
    }
}

export const addPreference = (data, user_id) => async dispatch => {
    try {
        const response = await axiosClient.post(`/api/users/${user_id}/preferences/`, data, {headers: {
            "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        console.log(response.data)
        return Promise.all[dispatch({type: ADD_PREFERENCE, payload: response.data}), dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "success", message: "Successfully added preference"}})]
    } catch(e) {
        dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "error", message: e.response.data.error}})
    }
}

export const editPreference = (data, user_id, pref_id) => async dispatch => {
    try {
        const response = await axiosClient.patch(`/api/users/${user_id}/preferences/${pref_id}/`, data, {headers: {
            "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        console.log(response.data)
        dispatch({type: EDIT_PREFERENCE, payload: response.data})
    } catch(e) {
        dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "Unable to edit preference."}})
    }
}

export const reorderPreferences = (data, user_id) => async dispatch => {
    try {
        const response = await axiosClient.patch(`/api/users/${user_id}/preferences/`, data, {headers: {
            "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        console.log(response.data)
        dispatch({type: REORDER_PREFERENCES, payload: response.data})
    } catch(e) {
        dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "Unable to reorder preference."}})
    }
}

export const deletePreference = (user_id, pref_id) => async dispatch => {
    try {
        const response = await axiosClient.delete(`/api/users/${user_id}/preferences/${pref_id}/`,  {headers: {
            "Authorization": `JWT ${localStorage.getItem('token')}`
            }}
        )
        console.log(response.data)
        return Promise.all(
            [dispatch({type: DELETE_PREFERENCE, payload: response.data}), 
                dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "success", message: "Successfully deleted preference"}})
            ]
        )
    } catch(e) {
        dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "Unable to delete preference."}})
    }
}