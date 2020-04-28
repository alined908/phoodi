import * as types from "../constants/action-types"

export const defaultState = {
    meetups: {},
    isMeetupsInitialized: false,
    isMeetupsFetching: false
}

export default function meetupReducer(state = defaultState, action){
    switch (action.type){
        case types.GET_MEETUPS_REQUEST:
            return {...state, isMeetupsFetching: true}
        case types.GET_MEETUPS_SUCCESS:
            return {...state, meetups: action.payload, isMeetupsInitialized: true, isMeetupsFetching: false}
        case types.GET_MEETUPS_ERROR:
            return {...state, isMeetupsFetching: false, errorMessage: action.payload.message}
        case types.ADD_MEETUP:
            return {
                ...state, 
                meetups: {
                    ...state.meetups, 
                    [action.payload.uri]: action.payload
                }
            }
        case types.EDIT_MEETUP:
            return {
                ...state, 
                meetups: {
                    ...state.meetups, 
                    [action.payload.uri]: {
                        ...action.payload, 
                        isMeetupEventsInitialized: true,
                        events: {
                            ...state.meetups[action.payload.uri].events
                        } 
                    }
                }
            }
        case types.DELETE_MEETUP:
            let meetups = {}
            Object.keys(state.meetups).forEach((key) => {
                if (key !== action.payload){
                    meetups[key] = state.meetups[key]
                }
            })
            return {...state, meetups: meetups}
        case types.ADD_MEETUP_MEMBER:
            return {
                ...state, 
                meetups: {
                    ...state.meetups, 
                    [action.payload.meetup]: {
                        ...state.meetups[action.payload.meetup], 
                        members: {
                            ...state.meetups[action.payload.meetup].members, 
                            ...action.payload.member
                        }
                    }
                }
            }
        case types.DELETE_MEETUP_MEMBER:
            return {
                ...state, 
                meetups: {
                    ...state.meetups, 
                    [action.payload.meetup]: {
                        ...state.meetups[action.payload.meetup],
                        members: action.payload.members
                    }
                }
            }
        case types.GET_MEETUP_EVENTS:
            return {
                ...state, 
                meetups: {
                    ...state.meetups, 
                    [action.payload.meetup]: {
                        ...state.meetups[action.payload.meetup], 
                        events: action.payload.events, 
                        isMeetupEventsInitialized: true
                    }
                }
            }
        case types.ADD_MEETUP_EVENT:
            return {
                ...state, 
                meetups: {
                    ...state.meetups, 
                    [action.payload.meetup]: {
                        ...state.meetups[action.payload.meetup], 
                        events: {
                            ...state.meetups[action.payload.meetup].events, 
                            ...action.payload.event
                        }
                    }
                }
            }
        case types.EDIT_MEETUP_EVENT:
            return {
                ...state, 
                meetups: {
                    ...state.meetups, 
                    [action.payload.meetup]: {
                        ...state.meetups[action.payload.meetup],
                        events: {
                            ...state.meetups[action.payload.meetup].events, 
                            [action.payload.event_id]: action.payload.event
                        }
                    }
                }
            }
        case types.DELETE_MEETUP_EVENT:
            let events = {}
            Object.keys(state.meetups[action.payload.meetup].events).forEach((key) => {
                if (key !== action.payload.event_id.toString()){
                    events[key] = state.meetups[action.payload.meetup].events[key]
                }
            })
            return {
                ...state, 
                meetups: {
                    ...state.meetups, 
                    [action.payload.meetup] : {
                        ...state.meetups[action.payload.meetup], 
                        events: events
                    }
                }
            }
        case types.VOTE_EVENT_OPTION:
            return {
                ...state, 
                meetups: {
                    ...state.meetups, 
                    [action.payload.meetup]: {
                        ...state.meetups[action.payload.meetup], 
                        members: {
                            ...state.meetups[action.payload.meetup].members, 
                            ...action.payload.member
                        },
                        events: {
                            ...state.meetups[action.payload.meetup].events, 
                            [action.payload.event_id]: {
                                ...state.meetups[action.payload.meetup].events[action.payload.event_id], 
                                options: {
                                    ...state.meetups[action.payload.meetup].events[action.payload.event_id].options, 
                                    [action.payload.option_id]: action.payload.option
                                }
                            }
                        }
                    }
                }
            }
        case types.ADD_EVENT_OPTION:
            return {
                ...state, 
                meetups: {
                    ...state.meetups, 
                    [action.payload.meetup]: {
                        ...state.meetups[action.payload.meetup], 
                        events: {
                            ...state.meetups[action.payload.meetup].events, 
                            [action.payload.event_id]: {
                                ...state.meetups[action.payload.meetup].events[action.payload.event_id], 
                                options: {
                                    ...state.meetups[action.payload.meetup].events[action.payload.event_id].options, 
                                    ...action.payload.option
                                }
                            }
                        }
                    }
                }
            }
        case types.DELETE_EVENT_OPTION:
            return {
                ...state, 
                meetups: {
                    ...state.meetups,
                    [action.payload.meetup]: {
                        ...state.meetups[action.payload.meetup],
                        events: {
                            ...state.meetups[action.payload.meetup].events,
                            [action.payload.event_id] : {
                                ...action.payload.event
                            }
                        }
                    }
                }
            }
        case types.CLEAR_STORE:
            return defaultState
        default:
            return state
    }
}