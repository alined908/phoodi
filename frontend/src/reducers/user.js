import {AUTH_USER, AUTH_ERROR, GET_FRIENDS, ADD_FRIEND, DELETE_FRIEND, FRIEND_ERROR} from "../constants/action-types"

const defaultState = {
    errorMessage: '',
    friends: [],
    isFriendsInitialized: false,
}

export default function(state = defaultState, action){
    switch(action.type){
        case AUTH_USER:
            let user = Object.values(action.payload.user)[0]
            return {...state, authenticated: action.payload.token, user: JSON.stringify(user)};
        case AUTH_ERROR:
            return {...state, errorMessage: action.payload};
        case GET_FRIENDS:
            console.log(action.payload)
            return {...state, isFriendsInitialized: true, friends: action.payload.friends}
        case ADD_FRIEND:
            return {...state, friends: [...state.friends, action.payload]}
        case FRIEND_ERROR:
            return {...state, errorMessage: action.payload}
        case DELETE_FRIEND:
            return state
        default:
            return state;
    }
}   