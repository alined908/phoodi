import {createStore, applyMiddleware, compose} from 'redux';
import reducers from "../reducers"
import reduxThunk from 'redux-thunk';
import {userDefaultState} from "../constants/default-states"

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const middleware = [reduxThunk]

export const store = createStore(
    reducers,
    {
        user: {authenticated: localStorage.getItem('token'), user: localStorage.getItem('user'), ...userDefaultState},
    },
    composeEnhancers(applyMiddleware(...middleware))
);