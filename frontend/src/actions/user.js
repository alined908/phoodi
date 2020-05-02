import * as types from '../constants/action-types'
import {axiosClient} from '../accounts/axiosClient'
import AuthenticationService from "../accounts/AuthenticationService";
import {history} from '../components/MeetupApp'
import {parseJWT} from '../constants/helpers'

export const signup = (formProps, redirectOnSuccess) => async dispatch => {
    try {
        const response = await axiosClient.post('/auth/users/', 
            formProps, {headers: {"Content-Type": 'multipart/form-data'
        }})
        console.log(response.data)
        dispatch({type: types.SIGNUP_SUCCESS, payload: "Your account has been registered. Complete signup by activating account in email."})
        // const decoded = parseJWT(response.data.access)
        // AuthenticationService.registerSuccessfulLogin(response.data.access, response.data.refresh)
        // localStorage.setItem("user", JSON.stringify(decoded.user))
        // dispatch({type: types.AUTH_USER, payload: {access: response.data.access, user: decoded.user}});
        // redirectOnSuccess();
    }
    catch (e){
        console.log(e.response)
        const firstKey = Object.keys(e.response.data)[0];
        const errorMessage = e.response.data[firstKey][0]
        dispatch({type: types.SIGNUP_ERROR, payload: errorMessage})
    }
}

export const signout = (redirectOnSuccess) => async dispatch => {
    AuthenticationService.logout()
    dispatch({type: types.CLEAR_STORE, payload: {}})
    redirectOnSuccess()
}

export const signin = (formProps, redirectOnSuccess) => async dispatch => {
    try {
        const response = await axiosClient.post('/api/token/', formProps)
        const decoded = parseJWT(response.data.access)
        AuthenticationService.registerSuccessfulLogin(response.data.access, response.data.refresh)
        localStorage.setItem("user", JSON.stringify(decoded.user))
        dispatch({type: types.AUTH_USER, payload: {access: response.data.access, user: decoded.user}});
        redirectOnSuccess();
    }
    catch (e){
        console.log("error signin");
        dispatch({type: types.LOGIN_ERROR, payload: "Email or password is incorrect"})
    }
}

export const refreshToken = (dispatch) => {
    console.log('refresh token function reached')
    const refresh = AuthenticationService.retrieveRefresh()
    var freshTokenPromise = axiosClient.post('/api/token/refresh/', {refresh})
        .then(res => {
            console.log(res.data)
            AuthenticationService.removeToken();
            AuthenticationService.setToken(res.data.access);
            dispatch({type: types.DONE_REFRESHING_TOKEN});
            const decoded = parseJWT(res.data.access)
            dispatch({type: types.AUTH_USER, payload: {access: res.data.access, user: decoded.user}});
            
            return res.data.access ? 
                Promise.resolve(res.data.access) : 
                Promise.reject({message: 'could not refresh token'});
        })
        .catch(e => {
            console.log('error refreshing token, lets sign out user', e);
            dispatch({type: types.DONE_REFRESHING_TOKEN});
            history.push('/logout')
            return Promise.reject(e);
        });

    dispatch({type: types.REFRESHING_TOKEN, payload: freshTokenPromise});

    return freshTokenPromise;
}

export const removeSuccessMessage = () => {
    return {
        type: types.SIGNUP_SUCCESS, payload: ""
    }
}

export const addSettings = (data) => async dispatch => {
    try {
        const response = await axiosClient.post('/api/users/settings/', data, {headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
        }})
        localStorage.setItem("user", JSON.stringify(response.data))
        return Promise.all([
            dispatch({type: types.ADD_SETTINGS, payload: response.data.settings}),
            dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "success", message: "Successfully saved settings."}})
        ])
    } catch(e){
        dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "Unable to save settings."}})
    }
}

export const setUserSettings = (data) => {
    return {
        type: types.ADD_SETTINGS,
        payload: {...data, radius: 25}
    }
}

export const getProfile = (id) => {
    try {
        const response = axiosClient.get(`/api/users/${id}/`, {headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
        }}
    )
        return response.data
    } catch(e){
        console.log(e)
    }
}

export const editUser = (formProps, user_id, onSuccess) => async dispatch => {
    try {
        const response = await axiosClient.patch(`/api/users/${user_id}/`, formProps, {headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`, "Content-Type": 'multipart/form-data'
        }})
        const settings = JSON.parse(AuthenticationService.retrieveUser()).settings
        let newUser = {...response.data, settings: settings}
        localStorage.setItem("user", JSON.stringify(newUser))
        dispatch({type: types.EDIT_USER, payload: response.data})
        onSuccess()
    } catch (e) {
        console.log(e)
    }
}

export const getPreferences = (user_id) => async dispatch => {
    try {
        const response = await axiosClient.get(`/api/users/${user_id}/preferences/`, {headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
            }}
        )
        dispatch({type: types.GET_PREFERENCES, payload: response.data})
    } catch(e) {
        console.log(e)
    }
}

export const addPreference = (data, user_id) => async dispatch => {
    try {
        const response = await axiosClient.post(`/api/users/${user_id}/preferences/`, data, {headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
            }}
        )
        return Promise.all([dispatch({type: types.ADD_PREFERENCE, payload: response.data}), dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "success", message: "Successfully added preference"}})])
    } catch(e) {
        dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "Unable to add preference."}})
    }
}

export const editPreference = (data, user_id, pref_id) => async dispatch => {
    try {
        const response = await axiosClient.patch(`/api/users/${user_id}/preferences/${pref_id}/`, data, {headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
            }}
        )
        dispatch({type: types.EDIT_PREFERENCE, payload: response.data})
    } catch(e) {
        dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "Unable to edit preference."}})
    }
}

export const reorderPreferences = (data, user_id) => async dispatch => {
    try {
        const response = await axiosClient.patch(`/api/users/${user_id}/preferences/`, data, {headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
            }}
        )
        dispatch({type: types.REORDER_PREFERENCES, payload: response.data})
    } catch(e) {
        dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "Unable to reorder preference."}})
    }
}

export const deletePreference = (user_id, category_id) => async dispatch => {
    try {
        const response = await axiosClient.delete(`/api/users/${user_id}/preferences/${category_id}/`,  {headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
            }}
        )
        return Promise.all(
            [dispatch({type: types.DELETE_PREFERENCE, payload: response.data}), 
                dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "success", message: "Successfully deleted preference"}})
            ]
        )
    } catch(e) {
        dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "Unable to delete preference."}})
    }
}