import userReducer from "../user";
import { userDefaultState } from "../../constants/default-states";
import * as types from "../../constants/action-types";
import {
  user,
  error,
  settings,
  friends,
  friend,
  friendInvite,
  preferences,
  preference,
} from "../../mocks/index";

describe("User Reducer", () => {
  it("should return default state", () => {
    const newState = userReducer(undefined, {});
    expect(newState).toEqual(userDefaultState);
  });

  it("should handle AUTH_USER", () => {
    const action = {
      type: types.AUTH_USER,
      payload: { user, access: "something" },
    };
    const newState = userReducer(userDefaultState, action);
    const expectedState = {
      ...userDefaultState,
      user,
      authenticated: "something",
    };
    expect(newState).toEqual(expectedState);
  });

  it("should handle SIGNUP_ERROR", () => {
    const action = {
      type: types.SIGNUP_ERROR,
      payload: error.message,
    };
    const newState = userReducer(userDefaultState, action);
    const expectedState = {
      ...userDefaultState,
      signupErrorMessage: error.message,
    };
    expect(newState).toEqual(expectedState);
  });

  it("should handle LOGIN_ERROR", () => {
    const action = {
      type: types.LOGIN_ERROR,
      payload: error.message,
    };
    const newState = userReducer(userDefaultState, action);
    const expectedState = {
      ...userDefaultState,
      loginErrorMessage: error.message,
    };
    expect(newState).toEqual(expectedState);
  });

  it("should handle REFRESHING_TOKEN", () => {});

  it("should handle DONE_REFRESHING_TOKEN", () => {
    const action = {
      type: types.DONE_REFRESHING_TOKEN,
    };
    const newState = userReducer(userDefaultState, action);
    const expectedState = { ...userDefaultState, freshTokenPromise: null };
    expect(newState).toEqual(expectedState);
  });

  it("should handle EDIT_USER", () => {
    const action = {
      type: types.EDIT_USER,
      payload: user,
    };
    const newState = userReducer(userDefaultState, action);
    const expectedState = { ...userDefaultState, user };
    expect(newState).toEqual(expectedState);
  });

  it("should handle ADD_SETTINGS", () => {
    const action = {
      type: types.ADD_SETTINGS,
      payload: settings,
    };
    const state = { ...userDefaultState, user };
    const newState = userReducer(state, action);
    const expectedState = {
      ...userDefaultState,
      user: { ...user, settings: { ...settings } },
    };
    expect(newState).toEqual(expectedState);
  });

  it("should handle GET_FRIENDS_SUCCESS", () => {
    const action = {
      type: types.GET_FRIENDS_SUCCESS,
      payload: friends,
    };
    const newState = userReducer(userDefaultState, action);
    const expectedState = {
      ...userDefaultState,
      friends,
      isFriendsInitialized: true,
      isFriendsFetching: false,
    };
    expect(newState).toEqual(expectedState);
  });

  it("should handle ADD_FRIEND", () => {
    const action = {
      type: types.ADD_FRIEND,
      payload: friend,
    };
    const state = { ...userDefaultState, friends };
    const newState = userReducer(state, action);
    const expectedState = {
      ...userDefaultState,
      friends: [...friends, friend],
    };
    expect(newState).toEqual(expectedState);
  });

  it("should handle DELETE_FRIEND", () => {
    const action = {
      type: types.DELETE_FRIEND,
      payload: friends,
    };
    const newState = userReducer(userDefaultState, action);
    const expectedState = { ...userDefaultState, friends };
    expect(newState).toEqual(expectedState);
  });

  it("should handle GET_FRIEND_INVITES_SUCCESS", () => {
    const action = {
      type: types.GET_FRIEND_INVITES_SUCCESS,
      payload: [friendInvite],
    };
    const newState = userReducer(userDefaultState, action);
    const expectedState = {
      ...userDefaultState,
      invites: {
        ...userDefaultState.invites,
        friends: [friendInvite],
        isFriendInvitesInitialized: true,
        isFriendInvitesFetching: false,
      },
    };
    expect(newState).toEqual(expectedState);
  });

  it("should handle GET_MEETUP_INVITES_SUCCESS", () => {
    const action = {
      type: types.GET_MEETUP_INVITES_SUCCESS,
      payload: [friendInvite],
    };
    const newState = userReducer(userDefaultState, action);
    const expectedState = {
      ...userDefaultState,

      invites: {
        ...userDefaultState.invites,
        meetups: [friendInvite],
        isMeetupInvitesInitialized: true,
        isMeetupInvitesFetching: false,
      },
    };
    expect(newState).toEqual(expectedState);
  });

  it("should handle GET_PREFERENCES", () => {
    const action = {
      type: types.GET_PREFERENCES,
      payload: preferences,
    };
    const newState = userReducer(userDefaultState, action);
    const expectedState = { ...userDefaultState, preferences };
    expect(newState).toEqual(expectedState);
  });

  it("should handle ADD_PREFERENCE", () => {
    const action = {
      type: types.ADD_PREFERENCE,
      payload: preference,
    };
    const state = { ...userDefaultState, preferences };
    const newState = userReducer(state, action);
    const expectedState = {
      ...userDefaultState,
      preferences: [...preferences, preference],
    };
    expect(newState).toEqual(expectedState);
  });

  it("should handle EDIT_PREFERENCE", () => {
    const action = {
      type: types.EDIT_PREFERENCE,
      payload: preferences,
    };
    const newState = userReducer(userDefaultState, action);
    const expectedState = { ...userDefaultState, preferences };
    expect(newState).toEqual(expectedState);
  });

  it("should handle REORDER_PREFERENCES", () => {
    const action = {
      type: types.REORDER_PREFERENCES,
      payload: preferences,
    };
    const newState = userReducer(userDefaultState, action);
    const expectedState = { ...userDefaultState, preferences };
    expect(newState).toEqual(expectedState);
  });

  it("should handle DELETE_PREFERENCE", () => {
    const action = {
      type: types.DELETE_PREFERENCE,
      payload: preferences,
    };
    const newState = userReducer(userDefaultState, action);
    const expectedState = { ...userDefaultState, preferences };
    expect(newState).toEqual(expectedState);
  });

  it("should handle CLEAR_STORE", () => {
    const action = { type: types.CLEAR_STORE };
    const newState = userReducer(userDefaultState, action);
    const expectedState = userDefaultState;
    expect(newState).toEqual(expectedState);
  });
});
