import * as types from '../constants/action-types'
import {userDefaultState} from "../constants/default-states"

export default function(state = userDefaultState, action){
    switch(action.type){
        case types.AUTH_USER:
            return {...state, authenticated: action.payload.access, user: action.payload.user};
        case types.SIGNUP_ERROR:
            return {...state, signupErrorMessage: action.payload}
        case types.LOGIN_ERROR:
            return {...state, loginErrorMessage: action.payload};
        case types.REFRESHING_TOKEN:
            return {...state, freshTokenPromise: action.payload}
        case types.DONE_REFRESHING_TOKEN:
            // console.log("Done refreshing token reducer")
            return {...state, freshTokenPromise: null}
        case types.EDIT_USER:
            return {...state, user: {...action.payload}}
        case types.ADD_SETTINGS:
            return {...state, user: {...state.user, settings: {...action.payload}}}
        case types.GET_FRIENDS:
            return {...state, isFriendsInitialized: true, friends: action.payload}
        case types.ADD_FRIEND:
            return {...state, friends: [...state.friends, action.payload]}
        case types.DELETE_FRIEND:
            return {...state, friends: [...action.payload]}
        case types.GET_FRIEND_INVITES:
            return {...state, invites: {...state.invites, friends: action.payload}, isFriendInvitesInitialized: true}
        case types.GET_MEETUP_INVITES:
            return {...state, invites: {...state.invites, meetups: action.payload}, isMeetupInvitesInitialized: true}
        case types.GET_PREFERENCES:
            return {...state, preferences: action.payload}
        case types.ADD_PREFERENCE:
            return {...state, preferences: [...state.preferences, action.payload]}
        case types.EDIT_PREFERENCE:
            return {...state, preferences: action.payload}
        case types.REORDER_PREFERENCES:
            return {...state, preferences: action.payload}
        case types.DELETE_PREFERENCE:
            return {...state, preferences: action.payload}
        case types.CLEAR_STORE:
            return userDefaultState
        default:
            return state;
    }
}   