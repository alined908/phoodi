import notifReducer, { defaultState } from "../notifs";
import * as types from "../../constants/action-types";

describe("Notification Reducer", () => {
  it("should return default state", () => {
    const newState = notifReducer(undefined, {});
    expect(newState).toEqual(defaultState);
  });

  it("should handle CREATE_NOTIF", () => {
    const action = {
      type: types.CREATE_NOTIF,
      payload: {},
    };
    const newState = notifReducer(defaultState, action);
    const expectedState = {...defaultState, notifications: [...defaultState.notifications, {}]};
    expect(newState).toEqual(expectedState);
  });

  it("should handle READ_NOTIF", () => {
    const action = {
      type: types.READ_NOTIF,
      payload: 1,
    };
    const updatedState = {...defaultState, notifications: [{id: 1}]}
    const newState = notifReducer(updatedState, action);
    const expectedState = {...updatedState, notifications: []};
    expect(newState).toEqual(expectedState);
  });

  it("should handle READ_ALL_NOTIFS", () => {
    const action = {
      type: types.READ_ALL_NOTIFS
    };
    const newState = notifReducer(defaultState, action);
    const expectedState = { ...defaultState, notifications: [] };
    expect(newState).toEqual(expectedState);
  });

  it("should handle CLEAR_STORE", () => {
    const action = { type: types.CLEAR_STORE };
    const newState = notifReducer(defaultState, action);
    const expectedState = defaultState;
    expect(newState).toEqual(expectedState);
  });
});
