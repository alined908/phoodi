import MockAdapter from "axios-mock-adapter";
import * as types from "../../constants/action-types";
import * as actions from "../../actions";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { axiosClient } from "../../accounts/axiosClient";
import * as mocks from "../../mocks";
import moment from "moment";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const mock = new MockAdapter(axiosClient);
const store = mockStore({});

describe("User actions", () => {
  beforeEach(() => {
    store.clearActions();
  });

  it("should handle signup", async () => {
    const expectedActions = [
      {
        type: types.SIGNUP_SUCCESS,
        payload: "Your account has been registered. Complete signup by activating account in email.",
      },
    ];

    mock.onPost("/auth/users/").reply(200, {});

    await store.dispatch(actions.signup({}, () => null));
    expect(store.getActions()).toEqual(expectedActions);
  });

  // it ('should handle signup error', async () => {
  //     const expectedActions = [
  //         {type: types.SIGNUP_ERROR}
  //     ]

  //     mock.onPost('/api/users/').reply(404)

  //     await store.dispatch(actions.signup({}, () => null))
  //     expect(store.getActions()).toEqual(expectedActions)
  // })

  it("should handle signout ", async () => {
    const expectedActions = [{ type: types.CLEAR_STORE, payload: {} }];

    await store.dispatch(actions.signout(() => null));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle signin", async () => {
    const expectedActions = [
      {
        type: types.AUTH_USER,
        payload: { access: mocks.tokens.access, user: mocks.userWithSettings },
      },
    ];

    mock.onPost("/api/token/").reply(200, { ...mocks.tokens });

    await store.dispatch(actions.signin({}, () => null));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle signin error", async () => {
    const expectedActions = [
      { type: types.LOGIN_ERROR, payload: "Email or password is incorrect" },
    ];

    mock.onPost("/api/token/").reply(400);

    await store.dispatch(actions.signin({}, () => null));
    expect(store.getActions()).toEqual(expectedActions);
  });

  // it ('should handle refresh token', async () => {
  //     const expectedActions = [
  //         {type: types.REFRESHING_TOKEN, payload: }
  //     ]
  // })

  it("should handle addSettings success", async () => {
    const expectedActions = [
      { type: types.ADD_SETTINGS, payload: { ...mocks.settings } },
      {
        type: types.ADD_GLOBAL_MESSAGE,
        payload: { type: "success", message: "Successfully saved settings." },
      },
    ];

    mock
      .onPost("/api/users/settings/")
      .reply(200, { ...mocks.userWithSettings });

    await store.dispatch(actions.addSettings({}));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle addSettings error", async () => {
    const expectedActions = [
      {
        type: types.ADD_GLOBAL_MESSAGE,
        payload: { type: "error", message: "Unable to save settings." },
      },
    ];

    mock.onPost("/api/users/settings/").reply(404);

    await store.dispatch(actions.addSettings({}));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle editUser success", async () => {
    const expectedActions = [
      { type: types.EDIT_USER, payload: { ...mocks.user } },
    ];

    mock.onPatch("/api/users/1/").reply(200, { ...mocks.user });

    await store.dispatch(actions.editUser({}, 1, () => null));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle setUserSettings success", () => {
    const settings = { ...mocks.settings };
    const expectedAction = {
      type: types.ADD_SETTINGS,
      payload: { ...settings, radius: 25 },
    };

    expect(actions.setUserSettings({ ...mocks.settings })).toEqual(
      expectedAction
    );
  });

  it("should handle getPreferences success", async () => {
    const expectedActions = [
      { type: types.GET_PREFERENCES, payload: mocks.preferences },
    ];

    mock.onGet("/api/users/1/preferences/").reply(200, [...mocks.preferences]);

    await store.dispatch(actions.getPreferences(1));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle addPreference success", async () => {
    const expectedActions = [
      { type: types.ADD_PREFERENCE, payload: mocks.preference },
      {
        type: types.ADD_GLOBAL_MESSAGE,
        payload: { type: "success", message: "Successfully added preference" },
      },
    ];

    mock
      .onPost("/api/users/1/preferences/")
      .reply(200, { ...mocks.preference });

    await store.dispatch(actions.addPreference({}, 1));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle addPreference error", async () => {
    const expectedActions = [
      {
        type: types.ADD_GLOBAL_MESSAGE,
        payload: { type: "error", message: "Unable to add preference." },
      },
    ];

    mock.onPost("/api/users/1/preferences/").reply(404);

    await store.dispatch(actions.addPreference({}, 1));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle editPreference success", async () => {
    const expectedActions = [
      { type: types.EDIT_PREFERENCE, payload: [...mocks.preferences] },
    ];

    mock
      .onPatch("/api/users/1/preferences/1/")
      .reply(200, [...mocks.preferences]);

    await store.dispatch(actions.editPreference({}, 1, 1));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle editPreference error", async () => {
    const expectedActions = [
      {
        type: types.ADD_GLOBAL_MESSAGE,
        payload: { type: "error", message: "Unable to edit preference." },
      },
    ];

    mock.onPatch("/api/users/1/preferences/1/").reply(404);

    await store.dispatch(actions.editPreference({}, 1, 1));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle reorderPreference success", async () => {
    const expectedActions = [
      { type: types.REORDER_PREFERENCES, payload: [...mocks.preferences] },
    ];

    mock
      .onPatch("/api/users/1/preferences/")
      .reply(200, [...mocks.preferences]);

    await store.dispatch(actions.reorderPreferences({}, 1));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle editPreference error", async () => {
    const expectedActions = [
      {
        type: types.ADD_GLOBAL_MESSAGE,
        payload: { type: "error", message: "Unable to reorder preference." },
      },
    ];

    mock.onPatch("/api/users/1/preferences/").reply(404);

    await store.dispatch(actions.reorderPreferences({}, 1));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle deletePreference success", async () => {
    const expectedActions = [
      { type: types.DELETE_PREFERENCE, payload: [...mocks.preferences] },
      {
        type: types.ADD_GLOBAL_MESSAGE,
        payload: {
          type: "success",
          message: "Successfully deleted preference",
        },
      },
    ];

    mock
      .onDelete("/api/users/1/preferences/1/")
      .reply(200, [...mocks.preferences]);

    await store.dispatch(actions.deletePreference(1, 1));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle deletePreference error", async () => {
    const expectedActions = [
      {
        type: types.ADD_GLOBAL_MESSAGE,
        payload: { type: "error", message: "Unable to delete preference." },
      },
    ];

    mock.onDelete("/api/users/1/preferences/1/").reply(404);

    await store.dispatch(actions.deletePreference(1, 1));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
