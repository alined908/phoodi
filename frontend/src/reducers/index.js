import { combineReducers } from "redux";
import userReducer from "./user";
import chatReducer from "./chat";
import { reducer as formReducer } from "redux-form";
import meetupReducer from "./meetup";
import notifReducer from "./notifs";
import searchReducer from './search';
import feedReducer from './feed';
import globalMessagesReducer from "./globalMessages";

const appReducer = combineReducers({
  user: userReducer,
  form: formReducer,
  chat: chatReducer,
  meetup: meetupReducer,
  notifs: notifReducer,
  search: searchReducer,
  feed: feedReducer,
  globalMessages: globalMessagesReducer,
});

export default appReducer;
