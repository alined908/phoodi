import * as types from "../constants/action-types";

export const defaultState = {
  rooms: {},
  messages: [],
  activeRoom: null,
  setTypingValue: "",
  isActiveRoomSet: false,
  isRoomsInitialized: false,
  isRoomsFetching: false,
  isMessagesInitialized: false,
  isMessagesFetching: false,
  isMoreMessagesFetching: false,
  isMoreRetrievable: false,
};

export default function chatReducer(state = defaultState, action) {
  switch (action.type) {
    case types.GET_ROOMS_REQUEST:
      return { ...state, isRoomsFetching: true };
    case types.GET_ROOMS_SUCCESS:
      return {
        ...state,
        rooms: action.payload,
        isRoomsInitialized: true,
        isRoomsFetching: false,
      };
    case types.GET_ROOMS_ERROR:
      return {
        ...state,
        isRoomsFetching: false,
        isRoomsInitialized: false,
        errorMessage: action.payload,
      };
    case types.GET_MESSAGES_REQUEST:
      return { ...state, isMessagesFetching: true };
    case types.GET_MESSAGES_SUCCESS:
      return {
        ...state,
        messages: action.payload.messages,
        isMoreRetrievable: action.payload.more,
        isMessagesInitialized: true,
        isMessagesFetching: false,
      };
    case types.GET_MESSAGES_ERROR:
      return {
        ...state,
        isMessagesFetching: false,
        errorMessage: action.payload,
      };
    case types.GET_MORE_MESSAGES_REQUEST:
      return { ...state, isMoreMessagesFetching: true };
    case types.GET_MORE_MESSAGES_SUCCESS:
      return {
        ...state,
        messages: [...action.payload.messages, ...state.messages],
        isMoreRetrievable: action.payload.more,
        isMoreMessagesFetching: false,
      };
    case types.GET_MORE_MESSAGES_ERROR:
      return {
        ...state,
        errorMessage: action.payload,
        isMoreMessagesFetching: false,
      };
    case types.ADD_ROOM:
      return { ...state, rooms: { ...state.rooms, ...action.payload } };
    case types.UPDATE_ROOM:
      return { ...state, rooms: { ...action.payload.room, ...state.rooms } };
    case types.SET_ACTIVE_ROOM:
      return {
        ...state,
        activeRoom: action.payload.uri,
        isActiveRoomSet: true,
        isMessagesInitialized: false,
      };
    case types.REMOVE_ACTIVE_ROOM:
      return {
        ...state,
        activeRoom: null,
        isActiveRoomSet: false,
        isMessagesInitialized: false,
      };
    case types.SET_TYPING_VALUE:
      return { ...state, setTypingValue: action.payload };
    case types.ADD_MESSAGE:
      return {
        ...state,
        setTypingValue: "",
        messages: [...state.messages, action.payload.message],
      };
    case types.CLEAR_STORE:
      return defaultState;
    default:
      return state;
  }
}
