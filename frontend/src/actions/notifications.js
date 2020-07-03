import * as types from "../constants/action-types";
import { axiosClient } from "../accounts/axiosClient";

export const getNotifs = () => async dispatch => {
  try {
    const response = await axiosClient.get("/api/notifications/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    dispatch({ type: types.GET_NOTIFS, payload: response.data });
  } catch (e) {
    console.log(e);
  }
}

export const createNotif = (event) => {
  return {
    type: types.CREATE_NOTIF,
    payload: event.message
  }
}

export const readNotif = id => {
  console.log(id)
  try {
    axiosClient.get(`/api/notifications/mark-as-read/${id}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return { 
      type: types.READ_NOTIF, 
      payload: id 
    };
  } catch (e) {
    console.log(e);
  }
}

export const readAllNotifs = () => async dispatch => {
  try {
    await axiosClient.get("/api/notifications/mark-all-as-read/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    dispatch({ type: types.READ_ALL_NOTIFS });
  } catch (e) {
    console.log(e);
  }
}