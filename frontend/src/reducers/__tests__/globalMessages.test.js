import globalMessageReducer from '../globalMessages'
import * as types from "../../constants/action-types"

const messageTypes = {error: "error", success: "success"}
const globalMessage = {type: messageTypes.error, message: "Error"}
const defaultState = []

describe('GlobalMessage Reducer' , () => {

    it ('should return default state', () => {
        const newState = globalMessageReducer(undefined, {});
        expect(newState).toEqual(defaultState);
    })

    it ('should handle ADD_GLOBAL_MESSAGE', () => {
        const action = {
            type: types.ADD_GLOBAL_MESSAGE,
            payload: globalMessage
        }
        const newState = globalMessageReducer(defaultState, action);
        const expectedState = [globalMessage]
        expect(newState).toEqual(expectedState)
    })

    it('should handle REMOVE_GLOBAL_MESSAGE', () => {
        const action = {
            type: types.REMOVE_GLOBAL_MESSAGE
        }
        const state = [globalMessage, globalMessage]
        const newState = globalMessageReducer(state, action);
        const expectedState = [globalMessage]
        expect(newState).toEqual(expectedState)
    })
})