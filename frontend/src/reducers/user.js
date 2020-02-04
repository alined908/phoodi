import {AUTH_USER, CLEAR_STORE, AUTH_ERROR, GET_FRIENDS, ADD_FRIEND, DELETE_FRIEND, FRIEND_ERROR, GET_MEETUP_INVITES, SEND_MEETUP_INVITE, RESPOND_MEETUP_INVITE} from "../constants/action-types"
import {userDefaultState} from "../constants/default-states"

const defaultState = userDefaultState

export default function(state = defaultState, action){
    switch(action.type){
        case AUTH_USER:
            let user = Object.values(action.payload.user)[0]
            return {...state, authenticated: action.payload.token, user: JSON.stringify(user)};
        case AUTH_ERROR:
            return {...state, errorMessage: action.payload};
        case GET_FRIENDS:
            return {...state, isFriendsInitialized: true, friends: action.payload.friends}
        case ADD_FRIEND:
            return {...state, friends: [...state.friends, action.payload]}
        case FRIEND_ERROR:
            return {...state, errorMessage: action.payload}
        case DELETE_FRIEND:
            return state
        case GET_MEETUP_INVITES:
            return {...state, invites: {...state.invites, meetups: action.payload}, isMeetupInvitesInitialized: true}
        case SEND_MEETUP_INVITE:
            return {...state}
        case RESPOND_MEETUP_INVITE:
            return {...state, invites: action.payload}
        case CLEAR_STORE:
            return defaultState
        default:
            return state;
    }
}   