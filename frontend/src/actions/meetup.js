import * as types from '../constants/action-types'
import {axiosClient} from '../accounts/axiosClient';
import {history} from '../components/MeetupApp'
import moment from 'moment';

const determineMeetupsParams = (data) => {
    let params;
    if (data.type === "private"){
        params = {
            type: data.type, 
            ...data.categories && {
                categories: data.categories
            },
            start: data.startDate,
            end: data.endDate
        }
    } else {
        params = {
            type: data.type, 
            ...data.categories && {categories: data.categories}, 
            latitude: data.coords.latitude, longitude: data.coords.longitude, 
            radius: data.coords.radius,start: data.startDate,
            end: data.endDate
        }
    }
    return params
}

export const getMeetups = (data) => async dispatch => {
    dispatch({type: types.GET_MEETUPS_REQUEST})
    const params = determineMeetupsParams(data)
    
    try {
        const response = await axiosClient.request({
            method: "GET",
            url: "/api/meetups/", 
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            params: params
        })
        dispatch({type: types.GET_MEETUPS_SUCCESS, payload: response.data.meetups})
    } catch(e){
        console.log(e)
        dispatch({type: types.GET_MEETUPS_ERROR, payload: e})
    }
}

export const getMeetup = (uri) => async dispatch => {
    try {
        const response = await axiosClient.get(
            `/api/meetups/${uri}/`, {headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }}
        )
        dispatch({type: types.ADD_MEETUP, payload: response.data})
    } catch(e){
        history.push('/404')
    }
}

export const addMeetup = (formProps, redirectOnSuccess) => async dispatch => {
    const params = {
        ...formProps, 
        date: moment(formProps.date).format("YYYY-MM-DD")
    }
    try {
        const response = await axiosClient.post(
            `/api/meetups/`, params, {headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
        }})
        dispatch({type: types.ADD_MEETUP, payload: response.data.meetup})
        console.log(response.data)
        redirectOnSuccess(response.data.meetup.uri)
    } catch(e){
        console.log(e)
    }
} 

export const editMeetup = (formProps, uri) => async dispatch => {
    const params = {
        ...formProps, 
        date: moment(formProps.date).format("YYYY-MM-DD")
    }
    try {
        const response = await axiosClient.patch(
            `/api/meetups/${uri}/`, params, {headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
        }})
        dispatch({type: types.EDIT_MEETUP, payload: response.data})
    } catch(e){
        console.log(e)
    }
}

export const deleteMeetup = (uri) => async dispatch => {
    try {
        const response = await axiosClient.delete(
            `/api/meetups/${uri}/`, {headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
        }})
        console.log(response)
        dispatch({type: types.DELETE_MEETUP, payload: uri})
        history.push(`/meetups`)
    } catch(e) {
        console.log(e)
    }
}

export const getMeetupEvents = (uri) => async dispatch => {
    try {
        const response = await axiosClient.get(
            `/api/meetups/${uri}/events/`, {headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
        }})
        console.log(response)
        dispatch({type: types.GET_MEETUP_EVENTS, payload: {meetup: uri, events: response.data}})
    } catch(e) {
        console.log(e)
    }
}

export const addMeetupEvent = (event) => async dispatch => {
    dispatch({type: types.ADD_MEETUP_EVENT, payload: event.message})
}

export const deleteMeetupEvent = (event) => async dispatch => {
    dispatch({type: types.DELETE_MEETUP_EVENT, payload: event.message})
}

export const reloadMeetupEvent = (event) => async dispatch => {
    dispatch({type: types.EDIT_MEETUP_EVENT, payload: event.message})
}

export const voteMeetupEvent = (event) => async dispatch => {
    dispatch({type: types.VOTE_EVENT_OPTION, payload: event.message})
}
    
export const decideMeetupEvent = (event) => async dispatch => {
    dispatch({type: types.EDIT_MEETUP_EVENT, payload: event.message})
}

export const addMeetupMember = (event) => async dispatch => {
    dispatch({type: types.ADD_MEETUP_MEMBER, payload: event.message})
}

export const deleteMeetupMember = (event) => async dispatch => {
    dispatch({type: types.DELETE_MEETUP_MEMBER, payload: event.message})
}

export const addEventOption = (event) => async dispatch => {
    dispatch({type: types.ADD_EVENT_OPTION, payload: event.message})
}

export const deleteEventOption = (event) => async dispatch => {
    dispatch({type: types.DELETE_EVENT_OPTION, payload: event.message})
}

export const sendMeetupEmails = (uri) => async dispatch => {

    try {
        await axiosClient.post(
            `/api/meetups/${uri}/email/`, {}, {headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
        }})
        dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "success", message: "Successfully sent emails"}})
    } catch(e) {
        dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "Unable to send emails"}})
    }
}