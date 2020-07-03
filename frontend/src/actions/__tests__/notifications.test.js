import MockAdapter from "axios-mock-adapter";
import * as types from "../../constants/action-types";
import * as actions from "../../actions";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { axiosClient } from "../../accounts/axiosClient";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const mock = new MockAdapter(axiosClient);
const store = mockStore({});

describe("Notifications actions", () => {
  beforeEach(() => {
    store.clearActions();
  });

  it("should handle getNotifs()", async () => {
    const expectedActions = [
      { type: types.GET_NOTIFS, payload: [] },
    ];

    mock.onGet("/api/notifications/").reply(200, []);

    await store.dispatch(actions.getNotifs());
    expect(store.getActions()).toEqual(expectedActions);
  });
});
