import MockAdapter from 'axios-mock-adapter';
import * as types from '../../constants/action-types'
import * as actions from "../../actions"
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {axiosClient} from '../../accounts/axiosClient'

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares); 
const mock = new MockAdapter(axiosClient); 
const store = mockStore({});

describe('Notifications actions', () => {

    beforeEach(() => {
        store.clearActions();
    })

    it ('should handle getNumberNotifs()', () => {
        const event = {message: "Good job."}
        const expectedAction = {type: types.GET_NOTIFS, payload: event.message}
        expect(actions.getNumberNotifs(event)).toEqual(expectedAction)
    })

    it ('should handle removeNotifs()', async () => {
        const expectedActions = [
            {type: types.REMOVE_NOTIFS, payload: {'something': 2}}
        ]

        mock.onDelete('/api/notifs/').reply(200, {'something': 2})

        await store.dispatch(actions.removeNotifs({'something': 2}))
        expect(store.getActions()).toEqual(expectedActions)
    })
})