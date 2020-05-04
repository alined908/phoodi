import * as types from "../constants/action-types";
import { axiosClient } from "../accounts/axiosClient";

export const getFriends = (id, category = null) => async (dispatch) => {
  dispatch({ type: types.GET_FRIENDS_REQUEST });
  try {
    const response = await axiosClient.get(`/api/users/${id}/friends/`, {
      params: { ...(category && { category }) },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    dispatch({ type: types.GET_FRIENDS_SUCCESS, payload: response.data });
  } catch (e) {
    dispatch({
      type: types.GET_FRIENDS_ERROR,
      payload: "Unable to get friends.",
    });
  }
};

export const deleteFriend = (user_id, friend_id) => async (dispatch) => {
  try {
    const response = await axiosClient.delete(
      `/api/users/${user_id}/friends/`,
      {
        data: { id: friend_id },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    Promise.all([
      dispatch({ type: types.DELETE_FRIEND, payload: response.data }),
      dispatch({
        type: types.ADD_GLOBAL_MESSAGE,
        payload: { type: "success", message: "Removed Friend" },
      }),
    ]);
  } catch (e) {
    dispatch({
      type: types.ADD_GLOBAL_MESSAGE,
      payload: { type: "error", message: "Unable to delete friend." },
    });
  }
};
