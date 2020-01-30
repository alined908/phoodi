import {GET_MEETUPS, ADD_MEETUP, DELETE_MEETUP} from '../constants/action-types';

const defaultState = {
    meetups: [],
    activeMeetup: null,
    isMeetupsInitialized: false,
}

export default function meetupReducer(state = defaultState, action){
    switch (action.type){
        case GET_MEETUPS:
            return {...state, meetups: action.payload, isMeetupsInitialized: true}
        case ADD_MEETUP:
            return {...state, meetups: [...state.meetups, action.payload]}
        case DELETE_MEETUP:
            var meetups = {}
            Object.keys(state.meetups).map((key) => {
                if (key !== action.payload){
                    meetups[key] = state.meetups[key]
                }
            })
            return {...state, meetups: meetups}
        default:
            return state
    }
}