import {GET_CHAT_NOTIFS, GET_INVITE_NOTIFS, CLEAR_STORE} from '../constants/action-types'

const defaultState = {
    chat: null,
    invite: null
}

export default function notifReducer(state = defaultState, action){
    switch(action.type){
        case GET_CHAT_NOTIFS:
            console.log(action.payload)
            return {...state, chat: action.payload}
        case GET_INVITE_NOTIFS:
            return {...state, invite: action.payload.message}
        case CLEAR_STORE:
            return defaultState
        default:
            return state
    }
}