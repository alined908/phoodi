import {combineReducers} from 'redux';
import auth from "./auth";
import chatReducer from "./chat"
import {reducer as formReducer} from 'redux-form';

export default combineReducers({
    auth: auth,
    form: formReducer,
    chat: chatReducer
});