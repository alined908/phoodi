import {ADD_GLOBAL_MESSAGE, REMOVE_GLOBAL_MESSAGE} from '../constants/action-types'

export const removeGlobalMessage = () => async dispatch => {
    console.log("remove error")
    dispatch({type: REMOVE_GLOBAL_MESSAGE})
}