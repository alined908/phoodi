import {GET_MEETUPS, ADD_MEETUP, DELETE_MEETUP, CLEAR_STORE} from '../constants/action-types';

const defaultState = {
    meetups: {},
    activeMeetup: null,
    isMeetupsInitialized: false,
}

export default function meetupReducer(state = defaultState, action){
    switch (action.type){
        case GET_MEETUPS:
            return {...state, meetups: action.payload, isMeetupsInitialized: true}
        case ADD_MEETUP:
            var meetup = {}
            console.log(action.payload)
            meetup[action.payload.uri] = action.payload
            return {...state, meetups: {...state.meetups, ...meetup}}
        case DELETE_MEETUP:
            var meetups = {}
            Object.keys(state.meetups).map((key) => {
                if (key !== action.payload){
                    meetups[key] = state.meetups[key]
                }
            })
            return {...state, meetups: meetups}
        case CLEAR_STORE:
            return defaultState
        default:
            return state
    }
}