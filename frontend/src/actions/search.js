import * as types from "../constants/action-types";

export const setSearchValue = value => {
    return {
        type: types.SET_SEARCH_VALUE,
        payload: value
    }
}

export const removeSearchValue = () => {
    return {
        type: types.REMOVE_SEARCH_VALUE
    }
}

export const setSearchLocationManual = (value) => {
    return {
        type: types.SET_SEARCH_LOCATION_MANUAL,
        payload: value
    }
}

export const setSearchLocation = (value, coords) => {
    return {
        type: types.SET_SEARCH_LOCATION,
        payload: {value, coords}
    }
}

export const removeSearchLocation = () => {
    return {
        type: types.REMOVE_SEARCH_LOCATION
    }
}

export const setSearchedLast = (value, location) => {
    return {
        type: types.SET_SEARCH_LAST,
        payload: {value: value, location: location}
    }
}

export const removeSearchedLast = () => {
    return {
        type: types.REMOVE_SEARCH_LAST,
    }
}

export const removeSearchedLocationLast = () => {
    return {
        type: types.REMOVE_SEARCH_LOCATION_LAST
    }
}
