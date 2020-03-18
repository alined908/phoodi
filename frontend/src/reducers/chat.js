import {CLEAR_STORE, GET_ROOMS, REMOVE_ACTIVE_ROOM, ADD_ROOM, SET_ACTIVE_ROOM, SET_TYPING_VALUE, ADD_MESSAGE, GET_MESSAGES} from "../constants/action-types"

const defaultState = {
    rooms: {},
    isRoomsInitialized: false,
    activeRoom: null,
    isActiveRoomSet: false,
    messages: {},
    isMessagesInitialized: false,
    setTypingValue: ""
}

export default function chatReducer(state = defaultState, action){
    switch(action.type){
        case GET_ROOMS:
            return {...state, rooms: action.payload, isRoomsInitialized: true}
        case ADD_ROOM:
            let rooms = state.rooms.concat([action.payload])
            return {...state, rooms: rooms}
        case SET_ACTIVE_ROOM:
            return {...state, activeRoom: action.payload.uri, isActiveRoomSet: true, isMessagesInitialized: false}
        case REMOVE_ACTIVE_ROOM:
            return {...state, activeRoom: null, isActiveRoomSet:false, isMessagesInitialized:false}
        case GET_MESSAGES:
            return {...state, messages: action.payload.messages, isMessagesInitialized: true}
        case SET_TYPING_VALUE:
            return {...state, setTypingValue: action.payload}
        case ADD_MESSAGE:
            return {...state, setTypingValue: '', messages: [...state.messages, {"message": action.payload.message}]}
        case CLEAR_STORE:
            return defaultState
        default:
            return state
    }
}