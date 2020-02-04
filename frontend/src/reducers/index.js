import {combineReducers} from 'redux';
import userReducer from "./user";
import chatReducer from "./chat"
import {reducer as formReducer} from 'redux-form';
import meetupReducer from './meetup';

export default combineReducers({
    user: userReducer,
    form: formReducer,
    chat: chatReducer,
    meetup: meetupReducer,
});