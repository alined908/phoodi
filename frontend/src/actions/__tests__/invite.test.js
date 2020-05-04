import MockAdapter from "axios-mock-adapter";
import * as types from "../../constants/action-types";
import * as actions from "../../actions";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { axiosClient } from "../../accounts/axiosClient";
import * as mocks from "../../mocks";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const mock = new MockAdapter(axiosClient);
const store = mockStore({});

describe("Invite actions", () => {
  beforeEach(() => {
    store.clearActions();
  });

  it("should handle getUserFriendInvites() success", async () => {
    const expectedActions = [
      { type: types.GET_FRIEND_INVITES_REQUEST },
      {
        type: types.GET_FRIEND_INVITES_SUCCESS,
        payload: [{ ...mocks.friendInvite }],
      },
    ];

    mock.onGet("/api/friends/invite/").reply(200, [{ ...mocks.friendInvite }]);

    await store.dispatch(actions.getUserFriendInvites());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle getUserFriendInvites() error", async () => {
    const expectedActions = [
      { type: types.GET_FRIEND_INVITES_REQUEST },
      {
        type: types.GET_FRIEND_INVITES_ERROR,
        payload: "Unable to get friend invites.",
      },
    ];

    mock.onGet("/api/friends/invite/").reply(404);
    await store.dispatch(actions.getUserFriendInvites());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle getUserMeetupInvites() success", async () => {
    const expectedActions = [
      { type: types.GET_MEETUP_INVITES_REQUEST },
      {
        type: types.GET_MEETUP_INVITES_SUCCESS,
        payload: [{ ...mocks.friendInvite }],
      },
    ];

    mock.onGet("/api/meetups/invite/").reply(200, [{ ...mocks.friendInvite }]);

    await store.dispatch(actions.getUserMeetupInvites());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle getUserMeetupInvites() error", async () => {
    const expectedActions = [
      { type: types.GET_MEETUP_INVITES_REQUEST },
      {
        type: types.GET_MEETUP_INVITES_ERROR,
        payload: "Unable to get meetup invites.",
      },
    ];

    mock.onGet("/api/meetups/invite/").reply(404);
    await store.dispatch(actions.getUserMeetupInvites());
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle sendMeetupInvite() success", async () => {
    const expectedActions = [
      {
        type: types.ADD_GLOBAL_MESSAGE,
        payload: {
          type: "success",
          message: "Invite for meetup sent to daniel.",
        },
      },
    ];

    mock
      .onPost("/api/meetups/uri/invite/")
      .reply(200, { message: "Invite for meetup sent to daniel." });
    await store.dispatch(actions.sendMeetupInvite("uri", "email@email.com"));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle sendMeetupInvite() error", async () => {
    const expectedActions = [
      {
        type: types.ADD_GLOBAL_MESSAGE,
        payload: { type: "error", message: "An error occurred." },
      },
    ];

    mock.onPost("/api/meetups/uri/invite/").reply(404);
    await store.dispatch(actions.sendMeetupInvite("uri", "email@email.com"));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle sendFriendInvite() success", async () => {
    const expectedActions = [
      {
        type: types.ADD_GLOBAL_MESSAGE,
        payload: { type: "success", message: "Invite sent to daniel." },
      },
    ];

    mock
      .onPost("/api/friends/invite/")
      .reply(200, { message: "Invite sent to daniel." });
    await store.dispatch(actions.sendFriendInvite("email@email.com"));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle sendFriendInvite() error", async () => {
    const expectedActions = [
      {
        type: types.ADD_GLOBAL_MESSAGE,
        payload: { type: "error", message: "An error occurred." },
      },
    ];

    mock.onPost("/api/friends/invite/").reply(404);
    await store.dispatch(actions.sendFriendInvite("email@email.com"));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle respondMeetupInvite() success", async () => {
    const expectedActions = [
      {
        type: types.ADD_GLOBAL_MESSAGE,
        payload: { type: "success", message: "accepted." },
      },
    ];

    mock
      .onPatch("/api/meetups/uri/invite/invuri/")
      .reply(200, { message: "accepted." });
    await store.dispatch(actions.respondMeetupInvite("uri", "invuri", 1));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle respondMeetupInvite() error", async () => {
    const expectedActions = [
      {
        type: types.ADD_GLOBAL_MESSAGE,
        payload: { type: "error", message: "An error occurred." },
      },
    ];

    mock.onPatch("/api/meetups/uri/invite/invuri/").reply(404);
    await store.dispatch(actions.respondMeetupInvite("uri", "invuri", 1));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle respondFriendInvite() success", async () => {
    const expectedActions = [
      {
        type: types.ADD_GLOBAL_MESSAGE,
        payload: { type: "success", message: "Accepted" },
      },
    ];

    mock
      .onPatch("/api/friends/invite/uri/", { status: 1 })
      .reply(200, { message: "Accepted" });
    await store.dispatch(actions.respondFriendInvite("uri", 1));
    expect(store.getActions()).toEqual(expectedActions);
  });

  it("should handle respondFriendInvite() error", async () => {
    const expectedActions = [
      {
        type: types.ADD_GLOBAL_MESSAGE,
        payload: { type: "error", message: "An error occurred." },
      },
    ];

    mock.onPatch("/api/friends/invite/uri/").reply(404);
    await store.dispatch(actions.respondMeetupInvite("uri", 1));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
