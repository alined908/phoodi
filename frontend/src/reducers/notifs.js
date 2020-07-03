import * as types from "../constants/action-types";

export const defaultState = {
  notifications: []
};

export default function notifReducer(state = defaultState, action) {
  switch (action.type) {
    case types.GET_NOTIFS:
      return {...state, notifications: action.payload}
    case types.CREATE_NOTIF:
      return { ...state, notifications: [...state.notifications, action.payload] };
    case types.READ_NOTIF:
      return {...state, notifications: state.notifications.filter(notif => notif.id !== action.payload)}
    case types.READ_ALL_NOTIFS:
      return {...state, notifications: []}
    case types.CLEAR_STORE:
      return defaultState;
    default:
      return state;
  }
}
