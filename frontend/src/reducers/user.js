import {AUTH_USER, CLEAR_STORE, REFRESHING_TOKEN, DONE_REFRESHING_TOKEN, SIGNUP_ERROR, LOGIN_ERROR, ADD_SETTINGS, EDIT_USER, GET_FRIENDS, ADD_FRIEND, DELETE_FRIEND,  GET_MEETUP_INVITES, GET_FRIEND_INVITES, GET_PREFERENCES, ADD_PREFERENCE, DELETE_PREFERENCE, REORDER_PREFERENCES, EDIT_PREFERENCE} from "../constants/action-types"
import {userDefaultState} from "../constants/default-states"

export default function(state = userDefaultState, action){
    switch(action.type){
        case AUTH_USER:
            return {...state, authenticated: action.payload.access, user: action.payload.user};
        case SIGNUP_ERROR:
            return {...state, signupErrorMessage: action.payload}
        case LOGIN_ERROR:
            return {...state, loginErrorMessage: action.payload};
        case REFRESHING_TOKEN:
            return {...state, freshTokenPromise: action.payload}
        case DONE_REFRESHING_TOKEN:
            // console.log("Done refreshing token reducer")
            return {...state, freshTokenPromise: null}
        case EDIT_USER:
            return {...state, user: {...action.payload}}
        case ADD_SETTINGS:
            return {...state, user: {...state.user, settings: {...action.payload}}}
        case GET_FRIENDS:
            return {...state, isFriendsInitialized: true, friends: action.payload}
        case ADD_FRIEND:
            return {...state, friends: [...state.friends, action.payload]}
        case DELETE_FRIEND:
            return {...state, friends: [...action.payload]}
        case GET_FRIEND_INVITES:
            return {...state, invites: {...state.invites, friends: action.payload}, isFriendInvitesInitialized: true}
        case GET_MEETUP_INVITES:
            return {...state, invites: {...state.invites, meetups: action.payload}, isMeetupInvitesInitialized: true}
        case GET_PREFERENCES:
            return {...state, preferences: action.payload}
        case ADD_PREFERENCE:
            return {...state, preferences: [...state.preferences, action.payload]}
        case EDIT_PREFERENCE:
            return {...state, preferences: action.payload}
        case REORDER_PREFERENCES:
            return {...state, preferences: action.payload}
        case DELETE_PREFERENCE:
            return {...state, preferences: action.payload}
        case CLEAR_STORE:
            return userDefaultState
        default:
            return state;
    }
}   