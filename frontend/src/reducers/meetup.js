import {GET_MEETUPS, ADD_MEETUP, DELETE_MEETUP, CLEAR_STORE, VOTE_MEETUP_EVENT, ADD_MEETUP_EVENT, GET_MEETUP_EVENTS, DELETE_MEETUP_EVENT, EDIT_MEETUP_EVENT} from '../constants/action-types';

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
            return {...state, meetups: {...state.meetups, [action.payload.uri]: action.payload}}
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
        case ADD_MEETUP_EVENT:
            return {...state, 
                        meetups: {...state.meetups, 
                            [action.payload.meetup]: {...state.meetups[action.payload.meetup], 
                                events: {...state.meetups[action.payload.meetup].events, 
                                    ...action.payload.event}}}}
        case EDIT_MEETUP_EVENT:
            const event_id = action.payload.event_id
            return {...state, 
                        meetups: {...state.meetups, 
                            [action.payload.meetup]: {...state.meetups[action.payload.meetup],
                                events: {...state.meetups[action.payload.meetup].events, [event_id]: action.payload.event}}}}
        case VOTE_MEETUP_EVENT:
            var meetup = action.payload.meetup
            return {...state, meetups: {...state.meetups, 
                            [meetup]: {...state.meetups[meetup], 
                                events: {...state.meetups[meetup].events, 
                                    [action.payload.event]: {...state.meetups[meetup].events[action.payload.event], 
                                        options: {...state.meetups[meetup].events[action.payload.event].options, 
                                            [action.payload.option_id]: action.payload.option
                    }}}}}}
        case DELETE_MEETUP_EVENT:
            var events = {}
            const uri = action.payload.uri
            Object.keys(state.meetups[uri].events).map((key) => {
                if (key !== action.payload.event.toString()){
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