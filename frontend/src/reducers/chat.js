import {GET_ROOMS_REQUEST, GET_ROOMS_SUCCESS, GET_ROOMS_ERROR, 
    GET_MESSAGES_REQUEST, GET_MESSAGES_SUCCESS, GET_MESSAGES_ERROR, 
    GET_MORE_MESSAGES_REQUEST, GET_MORE_MESSAGES_SUCCESS, GET_MORE_MESSAGES_ERROR,
    CLEAR_STORE, REMOVE_ACTIVE_ROOM, ADD_ROOM, SET_ACTIVE_ROOM, SET_TYPING_VALUE, ADD_MESSAGE} from "../constants/action-types"

const defaultState = {
    rooms: {},
    messages: [],
    activeRoom: null,
    setTypingValue: "",
    isActiveRoomSet: false,
    isRoomsInitialized: false,
    isRoomsFetching: false,
    isMessagesInitialized: false,
    isMessagesFetching: false,
    isMoreMessagesFetching: false
}

export default function chatReducer(state = defaultState, action){
    switch(action.type){
        case GET_ROOMS_REQUEST:
            return {...state, isRoomsFetching: true}
        case GET_ROOMS_SUCCESS:
            return {...state, rooms: action.payload, isRoomsInitialized: true, isRoomsFetching: false}
        case GET_ROOMS_ERROR:
            return {...state, isRoomsFetching: false, errorMessage: action.payload.message}
        case GET_MESSAGES_REQUEST:
            return {...state, isMessagesFetching: true}
        case GET_MESSAGES_SUCCESS:
            return {...state, messages: action.payload, isMessagesInitialized: true, isMessagesFetching: false}
        case GET_MESSAGES_ERROR:
            return {...state, isMessagesFetching: false, errorMessage: action.payload.message}
        case GET_MORE_MESSAGES_REQUEST:
            return {...state, isMoreMessagesFetching: true}
        case GET_MORE_MESSAGES_SUCCESS:
            return {...state, messages: [...action.payload, ...state.messages], isMoreMessagesFetching: false}
        case GET_MORE_MESSAGES_ERROR:
            return {...state, errorMessage: action.payload.message, isMoreMessagesFetching: false}
        case ADD_ROOM:
            return {...state, rooms: state.rooms.concat([action.payload])}
        case SET_ACTIVE_ROOM:
            return {...state, activeRoom: action.payload.uri, isActiveRoomSet: true, isMessagesInitialized: false}
        case REMOVE_ACTIVE_ROOM:
            return {...state, activeRoom: null, isActiveRoomSet:false, isMessagesInitialized:false}
        case SET_TYPING_VALUE:
            return {...state, setTypingValue: action.payload}
        case ADD_MESSAGE:
            return {...state, setTypingValue: '', messages: [...state.messages, action.payload.message]}
        case CLEAR_STORE:
            return defaultState
        default:
            return state
    }
}