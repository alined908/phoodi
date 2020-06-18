import { combineReducers } from "redux";
import userReducer from "./user";
import chatReducer from "./chat";
import { reducer as formReducer } from "redux-form";
import meetupReducer from "./meetup";
import notifReducer from "./notifs";
import searchReducer from './search'
import globalMessagesReducer from "./globalMessages";
import challengeReducer from "./challenge";

const appReducer = combineReducers({
  user: userReducer,
  form: formReducer,
  chat: chatReducer,
  meetup: meetupReducer,
  notifs: notifReducer,
  search: searchReducer,
  challenge: challengeReducer,
  globalMessages: globalMessagesReducer,
});

export default appReducer;
