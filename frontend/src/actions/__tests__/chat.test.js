import MockAdapter from 'axios-mock-adapter';
import * as types from '../../constants/action-types'
import * as actions from "../../actions"
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import * as mocks from '../../mocks'

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares); 
const mock = new MockAdapter(axios); 
const store = mockStore({});

describe('Chat actions', () => {

    beforeEach(() => {
        store.clearActions();
    })

    it ('should handle getRooms()', () => {
        const expectedActions = [
            {type: types.GET_ROOMS_REQUEST},
            {type: types.GET_ROOMS_SUCCESS, payload: {...mocks.room}}
        ]

        mock.onGet('/api/chats/').reply(200, {
            data: [
                {...mocks.room}
            ]
        })

        store.dispatch(actions.getRooms()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
        })
    })

    it ('should handle getRoom', () => {
        const expectedActions = [
            {type: types.GET_ROOMS_REQUEST},
            {type: types.GET_ROOMS_SUCCESS, payload: {...mocks.room}}
        ]

        mock.onGet(`/api/chats/uri/`).reply(200, {
            data: [
                {...mocks.room}
            ]
        })

        store.dispatch(actions.getRoom()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
        })
    })

    it ('should handle getMessages()', () => {
        const expectedActions = [
            {type: types.GET_MESSAGES_REQUEST},
            {type: types.GET_MESSAGES_SUCCESS, payload: [...mocks.messages]}
        ]

        mock.onGet(`/api/chats/uri/messages/`).reply(200, {
            data: [
                [...mocks.messages]
            ]
        })

        store.dispatch(actions.getMessages()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
        })
    })

    it ('should handle getMoreMessages()', () => {
        const expectedActions = [
            {type: types.GET_MORE_MESSAGES_REQUEST},
            {type: types.GET_MORE_MESSAGES_SUCCESS, payload: [...mocks.messages]}
        ]

        mock.onGet(`/api/chats/uri/messages/`, {params: {last: 50}}).reply(200, {
            data: [
                [...mocks.messages]
            ]
        })

        store.dispatch(actions.getMoreMessages()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
        })
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
