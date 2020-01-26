import {createStore, applyMiddleware, compose} from 'redux';
import reducers from "../reducers"
import reduxThunk from 'redux-thunk';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const middleware = [reduxThunk]

export const store = createStore(
    reducers,
    {
        auth: {authenticated: localStorage.getItem('token'), user: localStorage.getItem('user')},
    },
    composeEnhancers(applyMiddleware(...middleware))
);