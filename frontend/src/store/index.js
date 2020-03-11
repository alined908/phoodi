import {createStore, applyMiddleware, compose} from 'redux';
import reducers from "../reducers"
import reduxThunk from 'redux-thunk';
import {userDefaultState} from "../constants/default-states"
import AuthenticationService from '../accounts/AuthenticationService'

// const checkJWTExpiration = store => next => action => {
//     const token = AuthenticationService.retrieveToken()
//     const expiration = AuthenticationService.retrieveExpiration()

//     //If token expired
//     if(expiration && (new Date(expiration*1000) < new Date())) {
        
//         //Get refresh token

//         //Use refresh token to get new token 


//         //Login again
//     }

//     //Send action along path
//     next(action)
// }

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const middleware = [reduxThunk]

export const store = createStore(
    reducers,
    {
        user: {authenticated: localStorage.getItem('token'), user: JSON.parse(localStorage.getItem('user')), ...userDefaultState},
    },
    composeEnhancers(applyMiddleware(...middleware))
);