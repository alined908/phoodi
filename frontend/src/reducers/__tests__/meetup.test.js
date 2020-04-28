import meetupReducer, {defaultState} from '../meetup';
import * as types from "../../constants/action-types";
import {error, meetup, meetups, meetupMembers, meetupMember1, meetupMember3, events, event, options, option} from "../../mocks/index"

describe('Meetup Reducer', () => {

    it('should return default state', () => {
        const newState = meetupReducer(undefined, {});
        expect(newState).toEqual(defaultState);
    })

    it('should handle GET_MEETUPS_REQUEST', () => {
        const action = {type: types.GET_MEETUPS_REQUEST}
        const newState = meetupReducer(defaultState, action)
        const expectedState = {...defaultState, isMeetupsFetching: true}
        expect(newState).toEqual(expectedState)
    })

    it('should handle GET_MEETUPS_SUCCESS', () => {
        const action = {
            type: types.GET_MEETUPS_SUCCESS, 
            payload: meetups
        }
        const newState = meetupReducer(defaultState, action)
        const expectedState = {...defaultState, meetups, isMeetupsFetching: false, isMeetupsInitialized: true}
        expect(newState).toEqual(expectedState)
    })

    it('should handle GET_MEETUPS_ERROR', () => {
        const action = {
            type: types.GET_MEETUPS_ERROR,
            payload: error
        }
        const newState = meetupReducer(defaultState, action)
        const expectedState = {...defaultState, isMeetupsFetching: false, errorMessage: error.message}
        expect(newState).toEqual(expectedState)
    })

    it('should handle ADD_MEETUP', () => {
        const action = {
            type: types.ADD_MEETUP,
            payload: meetup.uri
        }
        const newState = meetupReducer(defaultState, action)
        const expectedState = {...defaultState, meetups}
        expect(newState).toEqual(expectedState)
    })

    it('should handle EDIT_MEETUP', () => {
        const action = {
            type: types.EDIT_MEETUP,
            payload: meetup.uri
        }
        const state = {...defaultState, meetups}
        const newState = meetupReducer(state, action)
        const expectedState = {...defaultState, meetups}
        expect(newState).toEqual(expectedState)
    })

    it('should handle DELETE_MEETUP', () => {
        const action = {
            type: types.DELETE_MEETUP,
            payload: meetup.uri.uri
        }
        const state = {...defaultState, meetups}
        const newState = meetupReducer(state, action)
        const expectedState = {...defaultState}
        expect(newState).toEqual(expectedState)
    })

    it('should handle ADD_MEETUP_MEMBER', () => {
        const action = {
            type: types.ADD_MEETUP_MEMBER,
            payload: {meetup: meetup.uri.uri, member: meetupMember3}
        }
        const state = {...defaultState, meetups}
        const newState = meetupReducer(state, action)
        const newMeetup = {...meetup, [meetup.uri.uri]: {...meetup.uri, members: {...meetup.uri.members, ...meetupMember3}}}
        const expectedState = {...defaultState, meetups: {...newMeetup}}
        expect(newState).toEqual(expectedState)
    })

    it('should handle DELETE_MEETUP_MEMBER', () => {
        const action = {
            type: types.DELETE_MEETUP_MEMBER,
            payload: {meetup: meetup.uri.uri, members: meetupMembers}
        }
        const state = {...defaultState, meetups}
        const newState = meetupReducer(state, action)
        const expectedState = {...defaultState, meetups: {...meetup}}
        expect(newState).toEqual(expectedState)
    })

    it('should handle GET_MEETUP_EVENTS', () => {
        const action = {
            type: types.GET_MEETUP_EVENTS,
            payload: {uri: meetup.uri.uri, events}
        }
        const state = {...defaultState, meetups}
        const newState = meetupReducer(state, action)
        const newEvent = {...meetup, [meetup.uri.uri]: {...meetup.uri, events: {...events}}}
        const expectedState = {...defaultState, meetups: {...newEvent}}
        expect(newState).toEqual(expectedState)
    })

    it('should handle ADD_MEETUP_EVENT', () => {
        const action = {
            type: types.ADD_MEETUP_EVENT,
            payload: {meetup: meetup.uri.uri, event: {...events}}
        }
        const state = {...defaultState, meetups}
        const newState = meetupReducer(state, action)
        const newEvent = {...meetup, [meetup.uri.uri]: {...meetup.uri, events: {...events}}}
        const expectedState = {...defaultState, meetups: {...newEvent}}
        expect(newState).toEqual(expectedState)
    })

    it('should handle EDIT_MEETUP_EVENT', () => {
        const action = {
            type: types.EDIT_MEETUP_EVENT,
            payload: {meetup: meetup.uri.uri, event_id: 1, event: event[1]}
        }
        const state = {...defaultState, meetups: {...meetup, [meetup.uri.uri]: {...meetup.uri, events: {...event}}}}
        const newState = meetupReducer(state, action)
        const newEvent = {...meetup, [meetup.uri.uri]: {...meetup.uri, events: {...events}}}
        const expectedState = {...defaultState, meetups: {...newEvent}}
        expect(newState).toEqual(expectedState)
    })

    it('should handle DELETE_MEETUP_EVENT', () => {
        const action = {
            type: types.DELETE_MEETUP_EVENT,
            payload: {uri: meetup.uri.uri, event: 1}
        }
        const state = {...defaultState, meetups}
        const newState = meetupReducer(state, action)
        const newEvent = {...meetup, [meetup.uri.uri]: {...meetup.uri, events: {}}}
        const expectedState = {...defaultState, meetups: {...newEvent}}
        expect(newState).toEqual(expectedState)
    })

    it('should handle ADD_EVENT_OPTION', () => {
        const action = {
            type: types.ADD_EVENT_OPTION,
            payload: {uri: meetup.uri.uri, event_id: 1, option}
        }
        const newEvent = {...meetup, [meetup.uri.uri]: {...meetup.uri, events: {...events}}}
        const state = {...defaultState, meetups: {...newEvent}}
        const newState = meetupReducer(state, action)
        const newOption = {...meetup, [meetup.uri.uri]: {...meetup.uri, events: {...events, [1]: {...event[1], options: {...options}}}}}
        const expectedState = {...defaultState, meetups: {...newOption}}
        expect(newState).toEqual(expectedState)
    })

    it('should handle VOTE_EVENT_OPTION', () => {
        const action = {
            type: types.VOTE_EVENT_OPTION,
            payload: {meetup: meetup.uri.uri, event_id: 1, option_id: 1, option: option[1], member: meetupMember1}
        }
        const newEvent = {...meetup, [meetup.uri.uri]: {...meetup.uri, events: {...events, [1]: {...event[1], options: {...options}}}}}
        const state = {...defaultState, meetups: {...newEvent}}
        const newState = meetupReducer(state, action)
        const newOption = {...meetup, [meetup.uri.uri]: {...meetup.uri, events: {...events, [1]: {...event[1], options: {...options,...option}}}}}
        const expectedState = {...defaultState, meetups: {...newOption}}
        expect(newState).toEqual(expectedState)
    })

    it('should handle DELETE_EVENT_OPTION', () => {
        const action = {
            type: types.DELETE_EVENT_OPTION,
            payload: {uri: meetup.uri.uri, event_id: 1, event: event[1]}
        }

        const state = {...defaultState, meetups: {...meetup, [meetup.uri.uri]: {...meetup.uri, events}}}
        const newState = meetupReducer(state, action)
        const newEvent = {...meetup, [meetup.uri.uri]: {...meetup.uri, events: {...events}}}
        const expectedState = {...defaultState, meetups: {...newEvent}}
        expect(newState).toEqual(expectedState)
    })

    it ('should handle CLEAR_STORE', () => {
        const action = {type: types.CLEAR_STORE}
        const newState = meetupReducer(defaultState, action)
        expect(newState).toEqual(defaultState)
    })
})