import * as types from "../constants/action-types";

export const defaultState = {
  activities: []
};

export default function feedReducer(state = defaultState, action) {
  switch (action.type) {
    case types.GET_ACTIVITIES:
      return {...state, activities: action.payload}
    case types.CLEAR_STORE:
      return defaultState;
    default:
      return state;
  }
}
