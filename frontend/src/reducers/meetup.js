import {GET_MEETUPS_REQUEST, GET_MEETUPS_SUCCESS, GET_MEETUPS_ERROR, 
        ADD_MEETUP, ADD_MEETUP_MEMBER, DELETE_MEETUP_MEMBER, DELETE_MEETUP, EDIT_MEETUP,
     CLEAR_STORE, VOTE_MEETUP_EVENT, ADD_MEETUP_EVENT, GET_MEETUP_EVENTS, DELETE_MEETUP_EVENT, 
     EDIT_MEETUP_EVENT, ADD_EVENT_OPTION, ADD_MEETUP_ACTIVITY, DELETE_EVENT_OPTION} from '../constants/action-types';

const defaultState = {
    meetups: {},
    isMeetupsInitialized: false,
    isMeetupsFetching: false
}

export default function meetupReducer(state = defaultState, action){
    switch (action.type){
        case GET_MEETUPS_REQUEST:
            return {...state, isMeetupsFetching: true}
        case GET_MEETUPS_SUCCESS:
            return {...state, meetups: action.payload, isMeetupsInitialized: true, isMeetupsFetching: false}
        case GET_MEETUPS_ERROR:
            return {...state, isMeetupsFetching: false, errorMessage: action.payload.message}
        case ADD_MEETUP:
            return {...state, meetups: {...state.meetups, [action.payload.uri]: action.payload}}
        case EDIT_MEETUP:
            return {...state, 
                meetups: {...state.meetups, 
                    [action.payload.uri]: {...action.payload, 
                        events: {...state.meetups[action.payload.uri].events},
                        isMeetupEventsInitialized: true
                    }
                }
            }
        case DELETE_MEETUP:
            var meetups = {}
            Object.keys(state.meetups).forEach((key) => {
                if (key !== action.payload){
                    meetups[key] = state.meetups[key]
                }
            })
            return {...state, meetups: meetups}
        case ADD_MEETUP_MEMBER:
            return {...state, meetups: {...state.meetups, 
                        [action.payload.meetup]: {...state.meetups[action.payload.meetup], 
                            members: {...state.meetups[action.payload.meetup].members, ...action.payload.member}}}}
        case DELETE_MEETUP_MEMBER:
            console.log(action.payload.members)
            return {...state, meetups: {
                        ...state.meetups, 
                        [action.payload.meetup]: {
                            ...state.meetups[action.payload.meetup],
                            members: action.payload.members
                        }
                    }
                }
        case GET_MEETUP_EVENTS:
            return {...state, meetups: {...state.meetups, 
                    [action.payload.uri]: {...state.meetups[action.payload.uri], 
                        events: action.payload.data, isMeetupEventsInitialized: true
                    }}}
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
            var member = action.payload.member
            return {...state, meetups: {...state.meetups, 
                            [meetup]: {...state.meetups[meetup], 
                                members: {...state.meetups[meetup].members, ...member},
                                events: {...state.meetups[meetup].events, 
                                    [action.payload.event]: {...state.meetups[meetup].events[action.payload.event], 
                                        options: {...state.meetups[meetup].events[action.payload.event].options, 
                                            [action.payload.option_id]: action.payload.option
                    }}}}}}
        case DELETE_MEETUP_EVENT:
            var events = {}
            const uri = action.payload.uri
            Object.keys(state.meetups[uri].events).forEach((key) => {
                if (key !== action.payload.event.toString()){
                    events[key] = state.meetups[uri].events[key]
                }
            })
            return {...state, meetups: {...state.meetups, [uri] : {...state.meetups[uri], events: events}}}
        case ADD_EVENT_OPTION:
            var mt_uri = action.payload.uri
            var et_id = action.payload.event_id
            return {...state, 
                meetups: {
                    ...state.meetups, 
                    [mt_uri]: {
                        ...state.meetups[mt_uri], 
                        events: {
                            ...state.meetups[mt_uri].events, 
                            [et_id]: {
                                ...state.meetups[mt_uri].events[et_id], 
                                options: {
                                    ...state.meetups[mt_uri].events[et_id].options, ...action.payload.option
                                }
                            }
                        }
                    }
                }
            }
        case DELETE_EVENT_OPTION:
            var m_uri = action.payload.uri
            return {...state, 
                meetups: {
                    ...state.meetups,
                    [m_uri]: {
                        ...state.meetups[m_uri],
                        events: {
                            ...state.meetups[m_uri].events,
                            [action.payload.event_id] : {
                                ...action.payload.event
                            }
                        }
                    }
                }
            }

        case ADD_MEETUP_ACTIVITY:
            var met_uri = action.payload.meetup
            
            return {...state, meetups: {...state.meetups, 
                [met_uri]: {...state.meetups[met_uri], 
                    notifications: [
                        action.payload.notification, ...state.meetups[met_uri].notifications, 
                    ]
                }
            }}
        case CLEAR_STORE:
            return defaultState
        default:
            return state
    }
}