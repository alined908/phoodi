import {AUTH_USER, AUTH_ERROR} from "../constants/action-types"

export default function(state = {authenticated: '', errorMessage: ''}, action){
    switch(action.type){
        case AUTH_USER:
            return {...state, authenticated: action.payload};
        case AUTH_ERROR:
            console.log("auth-error");
            return {...state, errorMessage: action.payload};
        default:
            return state;
    }
}   