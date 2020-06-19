import * as types from "../constants/action-types";

export const defaultState = {
    restaurants: [],
    categories: [],
    matrix: {},
    matrixHistory: [],
    page: 0,
    isMatrixConstructed: false
}

export default function challengeReducer(state=defaultState, action){

    switch(action.type){
        case types.GET_RESTAURANTS_REQUEST:
            return {...state, isRestaurantsFetching: true}
        case types.GET_RESTAURANTS_SUCCESS:
            return {...state, restaurants: action.payload, isRestaurantsFetching: false, isRestaurantsInitialized: true}
        case types.GET_RESTAURANTS_ERROR:
            return {...state, isRestaurantsFetching: false, isRestaurantsInitialized: false}
        case types.GET_CATEGORIES_REQUEST:
            return {...state, isCategoriesFetching: true}
        case types.GET_CATEGORIES_SUCCESS:
            return {...state, categories: action.payload, isCategoriesFetching: false, isCategoriesInitialized: true}
        case types.GET_CATEGORIES_ERROR:
            return {...state, isCategoriesFetching: false, isCategoriesInitialized: false}
        case types.CONSTRUCT_MATRIX:
            return {...state, matrix: action.payload, isMatrixConstructed: true, matrixHistory: [action.payload]}
        case types.RECONSTRUCT_MATRIX:
            return {...state, matrix: action.payload, matrixHistory: [...state.matrixHistory.splice(0, state.page + 1), action.payload], page: state.page + 1}
        case types.UNDO_MATRIX:
            return {...state, page: state.page - 1, matrix: state.matrixHistory[state.page - 1]}
        case types.REDO_MATRIX:
            return {...state, page: state.page + 1, matrix: state.matrixHistory[state.page + 1]} 
        default:
            return state
    }
}