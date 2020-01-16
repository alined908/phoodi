import {AUTH_USER, AUTH_ERROR} from "../constants/action-types"

export default function(state = {authenticated: '', errorMessage: ''}, action){
    switch(action.type){
        case AUTH_USER:
            let user = Object.values(action.payload.user)[0]
            return {...state, authenticated: action.payload.token, user: user};
        case AUTH_ERROR:
            return {...state, errorMessage: action.payload};
        default:
            return state;
    }
}   