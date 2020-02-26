import {GET_NOTIFS} from "../constants/action-types"

export const getNumberNotifs = (event) => async dispatch => {
    dispatch({type: GET_NOTIFS, payload: event.message})
}