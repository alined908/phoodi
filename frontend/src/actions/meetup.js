import * as types from "../constants/action-types";
import { axiosClient } from "../accounts/axiosClient";
import { history } from "../components/MeetupApp";
import moment from "moment";

export const getMeetups = (data) => async (dispatch) => {
  console.log(data)
  dispatch({ type: types.GET_MEETUPS_REQUEST });

  try {
    const response = await axiosClient.request({
      method: "GET",
      url: "/api/meetups/",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      params: data,
    });
    dispatch({
      type: types.GET_MEETUPS_SUCCESS,
      payload: response.data.meetups,
    });
  } catch (e) {
    dispatch({
      type: types.GET_MEETUPS_ERROR,
      payload: "Unable to get meetups.",
    });
  }
};

export const getMeetup = (uri) => async (dispatch) => {
  try {
    const response = await axiosClient.get(`/api/meetups/${uri}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    dispatch({ type: types.ADD_MEETUP, payload: response.data });
  } catch (e) {
    history.push("/404");
  }
};

export const addMeetup = (formProps, redirectOnSuccess) => async (dispatch) => {
  const params = {
    ...formProps,
    date: moment(formProps.date).format("YYYY-MM-DD"),
  };
  try {
    const response = await axiosClient.post(`/api/meetups/`, params, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    dispatch({ type: types.ADD_MEETUP, payload: response.data.meetup });
    redirectOnSuccess(response.data.meetup.uri);
  } catch (e) {
    console.log("some error");
  }
};

export const editMeetup = (formProps, uri) => async (dispatch) => {
  const params = {
    ...formProps,
    date: moment(formProps.date).format("YYYY-MM-DD"),
  };
  try {
    const response = await axiosClient.patch(`/api/meetups/${uri}/`, params, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    dispatch({ type: types.EDIT_MEETUP, payload: response.data });
  } catch (e) {
    console.log("some error");
  }
};

export const deleteMeetup = (uri) => async (dispatch) => {
  try {
    await axiosClient.delete(`/api/meetups/${uri}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    dispatch({ type: types.DELETE_MEETUP, payload: uri });
    history.push(`/meetups`);
  } catch (e) {
    console.log("some error");
  }
};

export const getMeetupEvents = (uri) => async (dispatch) => {
  try {
    dispatch({
      type: types.GET_MEETUP_EVENTS_REQUEST,
      payload: { meetup: uri },
    });
    const response = await axiosClient.get(`/api/meetups/${uri}/events/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    dispatch({
      type: types.GET_MEETUP_EVENTS_SUCCESS,
      payload: { meetup: uri, events: response.data },
    });
  } catch (e) {
    dispatch({
      type: types.GET_MEETUP_EVENTS_ERROR,
      payload: { meetup: uri, message: "Unable to get events." },
    });
    console.log("some error");
  }
};

export const newMeetupEvent = (uri, data) => async (dispatch) => {
    try {
        await axiosClient.post(`/api/meetups/${uri}/events/`, data, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "success", message: "New Meetup Event Added"}});
    } catch (e) {
        dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "Something went wrong"}});
    }
}

export const editMeetupEvent = (uri, event, data) => async (dispatch) =>{
    try {
        await axiosClient.patch(
          `/api/meetups/${uri}/events/${event}/`,
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "success", message: "Meetup Event Changed"}});
      } catch (e) {
        dispatch({type: types.ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "Something went wrong"}});
      }
}

export const handleLeaveMeetup = (uri, email, userEmail) => async (
  dispatch
) => {
  try {
    await axiosClient.delete(`/api/meetups/${uri}/members/`, {
      data: { email },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (email === userEmail) {
      history.push("/meetups");
      dispatch({
        type: types.ADD_GLOBAL_MESSAGE,
        payload: { type: "success", message: "Left meetup" },
      });
    } else {
      dispatch({
        type: types.ADD_GLOBAL_MESSAGE,
        payload: { type: "success", message: "Removed Member from Meetup" },
      });
    }
  } catch (e) {
    dispatch({
      type: types.ADD_GLOBAL_MESSAGE,
      payload: {
        type: "error",
        message: "Unable to leave meetup. You are stuck!!",
      },
    });
  }
};

export const handlePublicMeetupJoin = (uri, email, callback) => async (
  dispatch
) => {
  try {
    await axiosClient.post(
      `/api/meetups/${uri}/members/`,
      { email },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    dispatch({
      type: types.ADD_GLOBAL_MESSAGE,
      payload: { type: "success", message: "Successfully joined meetup" },
    });
    callback();
  } catch (e) {
    dispatch({
      type: types.ADD_GLOBAL_MESSAGE,
      payload: { type: "error", message: "Not able to join this meetup" },
    });
  }
};

export const addMeetupEvent = (event) => async (dispatch) => {
  dispatch({ type: types.ADD_MEETUP_EVENT, payload: event.message });
};

export const deleteMeetupEvent = (event) => async (dispatch) => {
  dispatch({ type: types.DELETE_MEETUP_EVENT, payload: event.message });
};

export const reloadMeetupEvent = (event) => async (dispatch) => {
  console.log(event.message);
  dispatch({ type: types.EDIT_MEETUP_EVENT, payload: event.message });
};

export const voteMeetupEvent = (event) => async (dispatch) => {
  dispatch({ type: types.VOTE_EVENT_OPTION, payload: event.message });
};

export const decideMeetupEvent = (event) => async (dispatch) => {
  dispatch({ type: types.EDIT_MEETUP_EVENT, payload: event.message });
};

export const addMeetupMember = (event) => async (dispatch) => {
  dispatch({ type: types.ADD_MEETUP_MEMBER, payload: event.message });
};

export const deleteMeetupMember = (event) => async (dispatch) => {
  dispatch({ type: types.DELETE_MEETUP_MEMBER, payload: event.message });
};

export const addEventOption = (event) => async (dispatch) => {
  dispatch({ type: types.ADD_EVENT_OPTION, payload: event.message });
};

export const deleteEventOption = (event) => async (dispatch) => {
  dispatch({ type: types.DELETE_EVENT_OPTION, payload: event.message });
};

export const sendMeetupEmails = (uri) => async (dispatch) => {
  try {
    await axiosClient.post(
      `/api/meetups/${uri}/email/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    dispatch({
      type: types.ADD_GLOBAL_MESSAGE,
      payload: { type: "success", message: "Successfully sent emails" },
    });
  } catch (e) {
    dispatch({
      type: types.ADD_GLOBAL_MESSAGE,
      payload: { type: "error", message: "Unable to send emails" },
    });
  }
};
