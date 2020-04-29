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

describe('Friend actions', () => {

    beforeEach(() => {
        store.clearActions();
    })

    it ('should handle getFriends() success', async () => {
        const expectedActions = [
            {type: types.GET_FRIENDS_REQUEST},
            {type: types.GET_FRIENDS_SUCCESS, payload: [...mocks.friends]}
        ]

        mock.onGet('/api/users/1/friends/').reply(200, [...mocks.friends])

        await store.dispatch(actions.getFriends(1))
        expect(store.getActions()).toEqual(expectedActions)
        
    })

    it ('should handle getFriends() error', async () => {
        const expectedActions = [
            {type: types.GET_FRIENDS_REQUEST},
            {type: types.GET_FRIENDS_ERROR, payload: "Unable to get friends."}
        ]

        mock.onGet('/api/users/1/friends/').reply(404)

        await store.dispatch(actions.getFriends(1))
        expect(store.getActions()).toEqual(expectedActions)

    })

    it ('should handle deleteFriend() success', async () => {
        const expectedActions = [
            {type: types.DELETE_FRIEND, payload: [...mocks.friends]},
            {type: types.ADD_GLOBAL_MESSAGE, payload: {type: "success", message: "Removed Friend"}}
        ]

        mock.onDelete('/api/users/1/friends/').reply(200, [...mocks.friends])

        await store.dispatch(actions.deleteFriend(1, 1))
        expect(store.getActions()).toEqual(expectedActions)
    })

    it ('should handle deleteFriend() error', async () => {
        const expectedActions = [
            {type: types.ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "Unable to delete friend."}}
        ]

        mock.onDelete('/api/users/1/friends/').reply(404)

        await store.dispatch(actions.deleteFriend(1, 1))
        expect(store.getActions()).toEqual(expectedActions)
    }) 
})