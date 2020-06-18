import * as types from "../constants/action-types";
import { axiosClient } from "../accounts/axiosClient";

export const getRestaurants = () => async dispatch => {
    dispatch({type: types.GET_RESTAURANTS_REQUEST})
    try {
        const response = await axiosClient.get(`/api/restaurants/challenge/`)
        dispatch({type: types.GET_RESTAURANTS_SUCCESS, payload: response.data})
    } catch(e) {
        dispatch({type: types.GET_RESTAURANTS_ERROR})
    }
}

export const getCategories = () => async dispatch => {
    dispatch({type: types.GET_CATEGORIES_REQUEST})
    try {
        const response = await axiosClient.get(`/api/categories/challenge/`)
        dispatch({type: types.GET_CATEGORIES_SUCCESS, payload: response.data})
    } catch(e) {
        dispatch({type: types.GET_CATEGORIES_ERROR})
    }
}

export const constructMatrix = (restaurants, numCategories) => {
    let matrix = {}
    restaurants.map((entity) => {
        matrix[entity.id] = Array(numCategories).fill(false)
    })
    console.log(matrix)
    return {
        type: types.CONSTRUCT_MATRIX,
        payload: matrix
    }
}

export const reconstructMatrix = newMatrix => {
    return {
        type: types.RECONSTRUCT_MATRIX,
        payload: newMatrix
    }
}

export const undoMatrix = () => {
    return {
        type: types.UNDO_MATRIX
    }
}

export const redoMatrix = () => {
    return {
        type: types.REDO_MATRIX
    }
}