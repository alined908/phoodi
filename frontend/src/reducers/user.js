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
        case types.GET_FRIENDS_REQUEST:
            return {...state, isFriendsFetching: true}
        case types.GET_FRIENDS_SUCCESS:
            return {...state, isFriendsFetching: false, isFriendsInitialized: true, friends: action.payload}
        case types.GET_FRIENDS_ERROR:
            return {...state, isFriendsFetching: false, isFriendsInitialized: false, errorMessage: action.payload}
        case types.ADD_FRIEND:
            return {...state, friends: [...state.friends, action.payload]}
        case types.DELETE_FRIEND:
            return {...state, friends: [...action.payload]}
        case types.GET_FRIEND_INVITES_REQUEST:
            return {...state, invites: {...state.invites, isFriendInvitesFetching: true}}
        case types.GET_FRIEND_INVITES_SUCCESS:
            return {...state, invites: {...state.invites, friends: action.payload, isFriendInvitesFetching: false, isFriendInvitesInitialized: true}}
        case types.GET_FRIEND_INVITES_ERROR:
            return {...state, invites: {...state.invites, isFriendInvitesFetching: false, isFriendInvitesInitialized: false, errorMessage: action.payload}}
        case types.GET_FRIEND_INVITES_REQUEST:
            return {...state, invites: {...state.invites, isMeetupInvitesFetching: true}}
        case types.GET_MEETUP_INVITES_SUCCESS:
            return {...state, invites: {...state.invites, meetups: action.payload, isMeetupInvitesFetching: false, isMeetupInvitesInitialized: true}}
        case types.GET_FRIEND_INVITES_ERROR:
            return {...state, invites: {...state.invites, isMeetupInvitesFetching: false, isMeetupInvitesInitialized: false, errorMessage: action.payload}}
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