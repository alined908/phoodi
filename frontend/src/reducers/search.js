import * as types from "../constants/action-types";

export const defaultState = {
    q: '',
    location: {},
    lastSearched: null,
    lastSearchedLocation: null,
}

export default function searchReducer(state = defaultState, action) {
    switch(action.type) {
        case types.SET_SEARCH_VALUE:
            return {...state, q: action.payload}
        case types.REMOVE_SEARCH_VALUE:
            return {...state, q: defaultState.q}
        case types.SET_SEARCH_LOCATION:
            return {...state, location: {...state.location, google: action.payload.value, coordinates: action.payload.coords, input: action.payload.value.description}}
        case types.SET_SEARCH_LOCATION_MANUAL:
            return {...state, location: {...state.location, input: action.payload}}
        case types.REMOVE_SEARCH_LOCATION:
            return {...state, location: defaultState.location}
        case types.SET_SEARCH_LAST:
            return {...state, lastSearched: action.payload.value, lastSearchedLocation: action.payload.location}
        case types.REMOVE_SEARCH_LAST:
            return {...state, lastSearched: defaultState.lastSearched}
        case types.REMOVE_SEARCH_LOCATION_LAST:
            return {...state, lastSearchedLocation: defaultState.lastSearchedLocation}
        default:
            return state
    }
}