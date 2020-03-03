import {AUTH_USER, CLEAR_STORE, AUTH_ERROR, GET_FRIENDS, ADD_FRIEND, DELETE_FRIEND, FRIEND_ERROR, GET_MEETUP_INVITES, SEND_MEETUP_INVITE, RESPOND_MEETUP_INVITE, GET_FRIEND_INVITES, SEND_FRIEND_INVITE, RESPOND_FRIEND_INVITE} from "../constants/action-types"
import {userDefaultState} from "../constants/default-states"

export default function(state = userDefaultState, action){
    switch(action.type){
        case AUTH_USER:
            let user = Object.values(action.payload.user)[0]
            console.log(user)
            return {...state, authenticated: action.payload.token, user: user};
        case AUTH_ERROR:
            return {...state, errorMessage: action.payload};
        case GET_FRIENDS:
            return {...state, isFriendsInitialized: true, friends: action.payload}
        case ADD_FRIEND:
            return {...state, friends: [...state.friends, action.payload]}
        case GET_FRIEND_INVITES:
            return {...state, invites: {...state.invites, friends: action.payload}, isFriendInvitesInitialized: true}
        case DELETE_FRIEND:
            return state
        case GET_MEETUP_INVITES:
            return {...state, invites: {...state.invites, meetups: action.payload}, isMeetupInvitesInitialized: true}
        case CLEAR_STORE:
            return userDefaultState
        default:
            return state;
    }
}   