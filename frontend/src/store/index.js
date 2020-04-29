import {createStore, applyMiddleware, compose} from 'redux';
import reducers from "../reducers"
import reduxThunk from 'redux-thunk';
import {userDefaultState} from "../constants/default-states"
import {parseJWT} from '../constants/helpers'
import {refreshToken} from "../actions"
import AuthenticationService from "../accounts/AuthenticationService";
import {history} from '../components/MeetupApp'

function jwtMiddleware({dispatch, getState}) {
    return (next) => (action) => {
        if (typeof action === 'function') {
            if(getState().user && getState().user.authenticated){
                const access = getState().user.authenticated
                const refresh = AuthenticationService.retrieveRefresh()
                const accessDecoded = parseJWT(access)
                const refreshDecoded = parseJWT(refresh)
                const unixSeconds =  Math.round(new Date().getTime() / 1000)

                if (accessDecoded.exp <= unixSeconds){
                    if(refreshDecoded.exp <= unixSeconds){
                        history.push('/logout')
                    } else {
                        if (!getState().user.freshTokenPromise){
                            console.log("refresh token not taking place")
                            return refreshToken(dispatch).then(() => next(action))
                        } else {
                            console.log("refresh token already taking place")
                            return getState().user.freshTokenPromise.then(() => next(action))
                        }
                    }
                }
            }
        }
        return next(action);
    }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const middleware = [jwtMiddleware, reduxThunk]

export const store = createStore(
    reducers,
    {
        user: {authenticated: localStorage.getItem('token'), 
        user: JSON.parse(localStorage.getItem('user')), ...userDefaultState},
    },
    composeEnhancers(applyMiddleware(...middleware))
);