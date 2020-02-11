import {GET_MEETUPS, ADD_MEETUP, DELETE_MEETUP, CLEAR_STORE, GET_MEETUP_EVENTS, DELETE_MEETUP_EVENT} from '../constants/action-types';

const defaultState = {
    meetups: {},
    activeMeetup: null,
    isMeetupsInitialized: false,
    isMeetupEventsInitialized: false,
}

export default function meetupReducer(state = defaultState, action){
    switch (action.type){
        case GET_MEETUPS:
            return {...state, meetups: action.payload, isMeetupsInitialized: true}
        case ADD_MEETUP:
            var meetup = {}
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
        case GET_MEETUP_EVENTS:
           var meetups = {}
           const data = action.payload.data
           Object.keys(state.meetups).map((key) => 
               (key === action.payload.uri) ? meetups[key] = ({...state.meetups[key], events: data}) : (meetups[key] = state.meetups[key])
           )
            return {...state, meetups: meetups, isMeetupEventsInitialized: true}
        case DELETE_MEETUP_EVENT:
            var events = {}
            const uri = action.payload.uri
            Object.keys(state.meetups[uri].events).map((key) => {
                if (key !== action.payload.id.toString()){
                    events[key] = state.meetups[uri].events[key]
                }
            })
            return {...state, meetups: {...state.meetups, [uri] : {...state.meetups[uri], events: events}}}
        case CLEAR_STORE:
            return defaultState
        default:
            return state
    }
}