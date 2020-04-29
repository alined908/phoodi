import configureMockStore from 'redux-mock-store';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import * as types from '../../constants/action-types'
import * as actions from "../../actions"
import thunk from 'redux-thunk';
import {user} from '../../mocks'

const mock = new MockAdapter(axios);
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const store = mockStore({});

describe('signup action' , () => {

    beforeEach(() => {
        mock.reset()
        store.clearActions();
    })

    it('dispatches AUTH_USER when signup is successful', async () => {
        const expectedActions = [
            {
                type: types.AUTH_USER, 
                payload: {
                    user,
                    access: "Something"
                }
            }
        ]

        mock.onPost(
            '/api/users/', 
            {...user, password: "password"}
        ).reply(200, [{access: "Something", refresh: "Refresh"}]);

        const data = await store.dispatch(actions.signup({...user, password: "pasword"}, () => null))
        const receivedActions = store.getActions();
        expected(receivedActions).toEqual(expectedActions)
    })
})


