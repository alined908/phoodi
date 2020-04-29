import MockAdapter from 'axios-mock-adapter';
import * as types from '../../constants/action-types'
import * as actions from "../../actions"
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {axiosClient} from '../../accounts/axiosClient'
import * as mocks from '../../mocks'
import moment from 'moment'

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares); 
const mock = new MockAdapter(axiosClient); 
const store = mockStore({});

describe('Invite actions', () => {

    beforeEach(() => {
        store.clearActions();
    })

    it ('should handle getMeetups success', async () => {
        const params = {type: "private", startDate: moment().format(), endDate: moment().format()}
        const expectedActions = [
            {type: types.GET_MEETUPS_REQUEST},
            {type: types.GET_MEETUPS_SUCCESS, payload: {...mocks.meetups}}
        ]

        mock.onGet("/api/meetups/").reply(200, {meetups: mocks.meetups})

        await store.dispatch(actions.getMeetups(params))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it ('should handle getMeetups error', async () => {
        const params = {type: "private", startDate: moment().format(), endDate: moment().format()}
        const expectedActions = [
            {type: types.GET_MEETUPS_REQUEST},
            {type: types.GET_MEETUPS_ERROR, payload: "Unable to get meetups."}
        ]

        mock.onGet("/api/meetups/").reply(404)
        await store.dispatch(actions.getMeetups(params))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it ('should handle getMeetup success', async () => {
        const expectedActions = [
            {type: types.ADD_MEETUP, payload: {...mocks.meetup.uri}}
        ]

        mock.onGet("/api/meetups/uri/").reply(200, {...mocks.meetup.uri})
        await store.dispatch(actions.getMeetup("uri"))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it ('should handle addMeetup success', async () => {
        const params = {date: new Date()}
        const expectedActions = [
            {type: types.ADD_MEETUP, payload: {...mocks.meetup.uri}}
        ]

        mock.onPost("/api/meetups/").reply(200, {meetup: {...mocks.meetup.uri}})
        await store.dispatch(actions.addMeetup(params, () => null))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it ('should handle editMeetup success', async () => {
        const params = {date: new Date()}
        const expectedActions = [
            {type: types.EDIT_MEETUP, payload: {...mocks.meetup.uri}}
        ]

        mock.onPatch("/api/meetups/uri/").reply(200, {...mocks.meetup.uri})
        await store.dispatch(actions.editMeetup(params, "uri"))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it ('should handle deleteMeetup success', async () => {
        const expectedActions = [
            {type: types.DELETE_MEETUP, payload: "uri"}
        ]

        mock.onDelete("/api/meetups/uri/").reply(200)
        await store.dispatch(actions.deleteMeetup("uri"))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it ('should handle getMeetupEvents success', async () => {
        const expectedActions = [
            {type: types.GET_MEETUP_EVENTS_REQUEST, payload: {meetup: "uri"}},
            {type: types.GET_MEETUP_EVENTS_SUCCESS, payload: {meetup: "uri", events: {...mocks.events}}}
        ]

        mock.onGet("/api/meetups/uri/events/").reply(200, {...mocks.events})

        await store.dispatch(actions.getMeetupEvents("uri"))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it ('should handle getMeetups error', async () => {
        const expectedActions = [
            {type: types.GET_MEETUP_EVENTS_REQUEST, payload: {meetup: "uri"}},
            {type: types.GET_MEETUP_EVENTS_ERROR, payload: {meetup: "uri", message: "Unable to get events."}}
        ]

        mock.onGet("/api/meetups/uri/events/").reply(404)
        await store.dispatch(actions.getMeetupEvents("uri"))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it('should handle addMeetupEvent()', async () => {
        const event = {message: "message"}
        const expectedActions = [{type: types.ADD_MEETUP_EVENT, payload: event.message}]

        await store.dispatch(actions.addMeetupEvent(event))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it('should handle deleteMeetupEvent()', async () => {
        const event = {message: "message"}
        const expectedActions = [{type: types.DELETE_MEETUP_EVENT, payload: event.message}]
        
        await store.dispatch(actions.deleteMeetupEvent(event))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it('should handle reloadMeetupEvent()', async () => {
        const event = {message: "message"}
        const expectedActions = [{type: types.EDIT_MEETUP_EVENT, payload: event.message}]
        
        await store.dispatch(actions.reloadMeetupEvent(event))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it('should handle voteMeetupEvent()', async () => {
        const event = {message: "message"}
        const expectedActions = [{type: types.VOTE_EVENT_OPTION, payload: event.message}]
        
        await store.dispatch(actions.voteMeetupEvent(event))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it('should handle decideMeetupEvent()', async () => {
        const event = {message: "message"}
        const expectedActions = [{type: types.EDIT_MEETUP_EVENT, payload: event.message}]
        
        await store.dispatch(actions.decideMeetupEvent(event))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it('should handle addMeetupMember()', async () => {
        const event = {message: "message"}
        const expectedActions = [{type: types.ADD_MEETUP_MEMBER, payload: event.message}]
        
        await store.dispatch(actions.addMeetupMember(event))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it('should handle deleteMeetupMember()', async () => {
        const event = {message: "message"}
        const expectedActions = [{type: types.DELETE_MEETUP_MEMBER, payload: event.message}]
        
        await store.dispatch(actions.deleteMeetupMember(event))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it('should handle addEventOption()', async () => {
        const event = {message: "message"}
        const expectedActions = [{type: types.ADD_EVENT_OPTION, payload: event.message}]
        
        await store.dispatch(actions.addEventOption(event))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it('should handle deleteEventOption()', async () => {
        const event = {message: "message"}
        const expectedActions = [{type: types.DELETE_EVENT_OPTION, payload: event.message}]
        
        await store.dispatch(actions.deleteEventOption(event))
        expect(store.getActions()).toEqual(expectedActions)
    })
    
    it ('should handle sendMeetupEmails success', async () => {
        const expectedActions = [
            {type: types.ADD_GLOBAL_MESSAGE, payload: {type: "success", message: "Successfully sent emails"}}
        ]

        mock.onPost("/api/meetups/uri/email/").reply(200)
        await store.dispatch(actions.sendMeetupEmails("uri"))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it ('should handle sendMeetupEmails success', async () => {
        const expectedActions = [
            {type: types.ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "Unable to send emails"}}
        ]

        mock.onPost("/api/meetups/uri/email/").reply(404)
        await store.dispatch(actions.sendMeetupEmails("uri"))
        expect(store.getActions()).toEqual(expectedActions)
    })
})