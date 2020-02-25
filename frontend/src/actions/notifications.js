import {GET_CHAT_NOTIFS, GET_INVITE_NOTIFS} from "../constants/action-types"

export const getNumberChatNotifs = (event) => async dispatch => {
    console.log("notif action called")
    dispatch({type: GET_CHAT_NOTIFS, payload: event.message})
}

export const getNumberInviteNotifs = (event) => async dispatch => {
    dispatch({type: GET_INVITE_NOTIFS, payload: event.message})
}