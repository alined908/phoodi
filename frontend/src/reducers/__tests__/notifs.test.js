import notifReducer, { defaultState } from "../notifs";
import * as types from "../../constants/action-types";

const notifs = {
  chat_message: 5,
  friend_inv: 5,
  meetup_inv: 5,
  meetup: 5,
  friend: 5,
};

describe("Notification Reducer", () => {
  it("should return default state", () => {
    const newState = notifReducer(undefined, {});
    expect(newState).toEqual(defaultState);
  });

  it("should handle GET_NOTIFS", () => {
    const action = {
      type: types.GET_NOTIFS,
      payload: { ...notifs },
    };
    const newState = notifReducer(defaultState, action);
    const expectedState = { ...notifs };
    expect(newState).toEqual(expectedState);
  });

  it("should handle REMOVE_NOTIFS", () => {
    const action = {
      type: types.REMOVE_NOTIFS,
      payload: notifs,
    };
    const newState = notifReducer(defaultState, action);
    const expectedState = { ...notifs };
    expect(newState).toEqual(expectedState);
  });

  it("should handle CLEAR_STORE", () => {
    const action = { type: types.CLEAR_STORE };
    const newState = notifReducer(defaultState, action);
    const expectedState = defaultState;
    expect(newState).toEqual(expectedState);
  });
});
