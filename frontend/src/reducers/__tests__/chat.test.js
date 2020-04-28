import chatReducer, {defaultState} from '../chat'
import * as types from "../../constants/action-types"
import {rooms, error, messages, room} from '../../mocks/index'

describe('Chat Reducer' , () => {

    it ('should return default state', () => {
        const newState = chatReducer(undefined, {});
        expect(newState).toEqual(defaultState);
    })

    it('should handle GET_ROOMS_REQUEST', () => {
        const action = {type: types.GET_ROOMS_REQUEST}
        const newState = chatReducer(defaultState, action)
        const expectedState = {...defaultState, isRoomsFetching: true}
        expect(newState).toEqual(expectedState)
    })

    it('should handle GET_ROOMS_SUCCESS', () => {
        const action = {
            type: types.GET_ROOMS_SUCCESS, 
            payload: rooms
        }
        const newState = chatReducer(defaultState, action)
        const expectedState = {...defaultState, rooms, isRoomsFetching: false, isRoomsInitialized: true, }
        expect(newState).toEqual(expectedState)
    })

    it('should handle GET_ROOMS_ERROR', () => {
        const action = {
            type: types.GET_ROOMS_ERROR,
            payload: error
        }
        const newState = chatReducer(defaultState, action)
        const expectedState = {...defaultState, isRoomsFetching: false, errorMessage: error.message}
        expect(newState).toEqual(expectedState)
    })

    it('should handle GET_MESSAGES_REQUEST', () => {
        const action = {type: types.GET_MESSAGES_REQUEST}
        const newState = chatReducer(defaultState, action)
        const expectedState = {...defaultState, isMessagesFetching: true}
        expect(newState).toEqual(expectedState)
    })

    it('should handle GET_MESSAGES_SUCCESS', () => {
        const action = {
            type: types.GET_MESSAGES_SUCCESS, 
            payload: {messages, more: false}
        }
        const newState = chatReducer(defaultState, action)
        const expectedState = {...defaultState, messages, isMoreRetrievable: false, isMessagesInitialized: true, isMessagesFetching:false}
        expect(newState).toEqual(expectedState)
    })

    it('should handle GET_MESSAGES_ERROR', () => {
        const action = {
            type: types.GET_MESSAGES_ERROR,
            payload: error
        }
        const newState = chatReducer(defaultState, action)
        const expectedState = {...defaultState, isMessagesFetching: false, errorMessage: error.message}
        expect(newState).toEqual(expectedState)
    })

    it('should handle GET_MORE_MESSAGES_REQUEST', () => {
        const action = {type: types.GET_MORE_MESSAGES_REQUEST}
        const newState = chatReducer(defaultState, action)
        const expectedState = {...defaultState, isMoreMessagesFetching: true}
        expect(newState).toEqual(expectedState)
    })

    it('should handle GET_MORE_MESSAGES_SUCCESS', () => {
        const action = {
            type: types.GET_MORE_MESSAGES_SUCCESS, 
            payload: {messages, more: false}
        }
        const state = {...defaultState, messages}
        const newState = chatReducer(state, action)
        const expectedState = {...defaultState, messages: [...messages, ...messages], isMoreRetrievable: false, isMoreMessagesFetching:false}
        expect(newState).toEqual(expectedState)
    })

    it('should handle GET_MORE_MESSAGES_ERROR', () => {
        const action = {
            type: types.GET_MORE_MESSAGES_ERROR,
            payload: error
        }
        const newState = chatReducer(defaultState, action)
        const expectedState = {...defaultState, isMoreMessagesFetching: false, errorMessage: error.message}
        expect(newState).toEqual(expectedState)
    })

    it('should handle ADD_ROOM', () => {
        const action = {
            type: types.ADD_ROOM,
            payload: room
        }
        const newState = chatReducer(defaultState, action)
        const expectedState = {...defaultState, rooms: {...room}}
        expect(newState).toEqual(expectedState)
    })

    it('should handle UPDATE_ROOM' , () => {
        const action = {
            type: types.UPDATE_ROOM,
            payload: {room: room}
        }
        const newState = chatReducer(defaultState, action)
        const expectedState = {...defaultState, rooms: {...room}}
        expect(newState).toEqual(expectedState)
    })

    it('should handle SET_ACTIVE_ROOM', () => {
        const action = {
            type: types.SET_ACTIVE_ROOM,
            payload: {uri: "uri"}
        };
        const newState = chatReducer(defaultState, action);
        const expectedState = {...defaultState, activeRoom: "uri", isActiveRoomSet: true, isMessagesInitialized: false};
        expect(newState).toEqual(expectedState)
    })

    it ('should handle REMOVE_ACTIVE_ROOM', () => {
        const action = {
            type: types.REMOVE_ACTIVE_ROOM
        }
        const newState = chatReducer(defaultState, action)
        const expectedState = {...defaultState, activeRoom: null, isActiveRoomSet: false, isMessagesInitialized: false}
        expect(newState).toEqual(expectedState)
    })

    it ('should handle SET_TYPING_VALUE', () => {
        const action = {
            type: types.SET_TYPING_VALUE,
            payload: "something"
        }
        const newState = chatReducer(defaultState, action);
        const expectedState = {...defaultState, setTypingValue: action.payload}
        expect(newState).toEqual(expectedState)
    })

    it ('should handle ADD_MESSAGE', () => {
        const action = {
            type: types.ADD_MESSAGE,
            payload: {
                message: messages[0]
            }
        }
        const newState = chatReducer(defaultState, action);
        const expectedState = {...defaultState, setTypingValue: '', messages: [action.payload.message]}
        expect(newState).toEqual(expectedState)
    })

    it ('should handle CLEAR_STORE', () => {
        const action = {type: types.CLEAR_STORE}
        const newState = chatReducer(defaultState, action)
        const expectedState = defaultState
        expect(newState).toEqual(expectedState)
    })
})