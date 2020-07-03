import * as types from "../constants/action-types";

export const defaultState = {
  activities: []
};

export default function feedReducer(state = defaultState, action) {
  switch (action.type) {
    case types.GET_ACTIVITIES_REQUEST:
        return {...state, isActivitiesFetching: true}
    case types.GET_ACTIVITIES_SUCCESS:
        return {...state, activities: action.payload, isActivitiesFetching: false, isActivitiesInitialized: true}
    case types.GET_ACTIVITIES_ERROR:
        return {...state, isActivitiesFetching: false, isActivitiesInitialized: false}
    case types.ADD_ACTIVITY:
        return {...state, activities: [action.payload, ...state.activities]}
    case types.CLEAR_STORE:
        return defaultState;
    default:
        return state;
  }
}
