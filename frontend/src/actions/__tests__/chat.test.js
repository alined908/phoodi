import MockAdapter from 'axios-mock-adapter';
import * as types from '../../constants/action-types'
import * as actions from "../../actions"
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {axiosClient} from '../../accounts/axiosClient'
import * as mocks from '../../mocks'

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares); 
const mock = new MockAdapter(axiosClient); 
const store = mockStore({});

describe('Chat actions', () => {

    beforeEach(() => {
        store.clearActions();
    })

    it ('should handle getRooms() success', async () => {
        const expectedActions = [
            {type: types.GET_ROOMS_REQUEST},
            {type: types.GET_ROOMS_SUCCESS, payload: {...mocks.room}}
        ]

        mock.onGet('/api/chats/').reply(200, {...mocks.room})

        await store.dispatch(actions.getRooms())
        expect(store.getActions()).toEqual(expectedActions)
    })

    it ('should handle getRooms() error', async () => {
        const expectedActions = [
            {type: types.GET_ROOMS_REQUEST},
            {type: types.GET_ROOMS_ERROR, payload: "Unable to get chat rooms."}
        ]

        mock.onGet('/api/chats/').reply(404)
        await store.dispatch(actions.getRooms())
        expect(store.getActions()).toEqual(expectedActions)
    })

    it ('should handle getRoom', async () => {
        const expectedActions = [
            {type: types.GET_ROOMS_REQUEST},
            {type: types.GET_ROOMS_SUCCESS, payload: {...mocks.room}}
        ]

        mock.onGet(`/api/chats/uri/`).reply(200, {...mocks.room})

        await store.dispatch(actions.getRoom("uri"))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it ('should handle getRoom() error', async () => {
        const expectedActions = [
            {type: types.GET_ROOMS_REQUEST},
            {type: types.GET_ROOMS_ERROR, payload: "Unable to get chat room."}
        ]

        mock.onGet('/api/chats/uri/').reply(404)
        await store.dispatch(actions.getRoom("uri"))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it ('should handle getMessages()', async () => {
        const expectedActions = [
            {type: types.GET_MESSAGES_REQUEST},
            {type: types.GET_MESSAGES_SUCCESS, payload: [...mocks.messages]}
        ]

        mock.onGet(`/api/chats/uri/messages/`).reply(200, [...mocks.messages])

        await store.dispatch(actions.getMessages("uri"))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it ('should handle getMessages() error', async () => {
        const expectedActions = [
            {type: types.GET_MESSAGES_REQUEST},
            {type: types.GET_MESSAGES_ERROR, payload: "Unable to get messages."}
        ]

        mock.onGet('/api/chats/uri/messages/').reply(404)
        await store.dispatch(actions.getMessages("uri"))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it ('should handle getMoreMessages()', async () => {
        const expectedActions = [
            {type: types.GET_MORE_MESSAGES_REQUEST},
            {type: types.GET_MORE_MESSAGES_SUCCESS, payload: [...mocks.messages]}
        ]

        mock.onGet(`/api/chats/uri/messages/`).reply(200, [...mocks.messages])

        await store.dispatch(actions.getMoreMessages("uri", 1))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it ('should handle getMoreMessages() error', async () => {
        const expectedActions = [
            {type: types.GET_MORE_MESSAGES_REQUEST},
            {type: types.GET_MORE_MESSAGES_ERROR, payload: "Unable to get more messages."}
        ]

        mock.onGet('/api/chats/uri/messages/').reply(404)
        await store.dispatch(actions.getMoreMessages("uri", 50))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it('should handle setActiveRoom()', () => {
        const room = "room"
        const expectedAction = {
            type: types.SET_ACTIVE_ROOM,
            payload: {"uri": room}
        }

        expect(actions.setActiveRoom(room)).toEqual(expectedAction)
    })

    it('should handle removeActiveRoom()', () => {
        const expectedAction = {
            type: types.REMOVE_ACTIVE_ROOM
        }

        expect(actions.removeActiveRoom()).toEqual(expectedAction)
    })

    it('should handle updateRoom()', () => {
        const event = {message: "message"}
        const expectedAction = {
            type: types.UPDATE_ROOM,
            payload: event.message
        }

        expect(actions.updateRoom(event)).toEqual(expectedAction)
    })

    it('should handle setTypingValue()', () => {
        const message = "message"
        const expectedAction = {
            type: types.SET_TYPING_VALUE,
            payload: message
        }

        expect(actions.setTypingValue(message)).toEqual(expectedAction)
    })

    it('should handle addMessage()', () => {
        const message = "message"
        const expectedAction = {
            type: types.ADD_MESSAGE,
            payload: {message}
        }

        expect(actions.addMessage(message)).toEqual(expectedAction)
    })
})
