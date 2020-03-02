import {GET_NOTIFS, REMOVE_NOTIFS, CLEAR_STORE} from '../constants/action-types'

const defaultState = {
    chat: null,
    friend_inv: null,
    meetup_inv: null,
    meetup: null,
}

export default function notifReducer(state = defaultState, action){
    switch(action.type){
        case GET_NOTIFS:
            return {...state, ...action.payload}
        case REMOVE_NOTIFS:
            return {...state, ...action.payload}
        case CLEAR_STORE:
            return defaultState
        default:
            return state
    }
}