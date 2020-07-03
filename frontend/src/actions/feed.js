import * as types from "../constants/action-types";
import { axiosClient } from "../accounts/axiosClient";

export const getActivities = () => async dispatch => {
    dispatch({type: types.GET_ACTIVITIES_REQUEST})
    try {
        const response = await axiosClient.get("/api/activities/", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        dispatch({ type: types.GET_ACTIVITIES_SUCCESS, payload: response.data });
    } catch (e) {
        console.log(e);
        dispatch({type: types.GET_ACTIVITIES_ERROR})
    }
}

export const addActivity = (activity) => {
    return {
        type: types.ADD_ACTIVITY,
        payload: activity
    }
}

export const postActivityLike = (activityId, newStatus) => {
    try {
        axiosClient.post(`/api/activities/${activityId}/likes/`, 
            {
                value: newStatus
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        )
    } catch(e) {
        console.log(e);
    }
}

export const postActivityCommentLike = (activityId, newStatus, commentID) => {
    try {
        axiosClient.post(`/api/activities/${activityId}/likes/`, 
            {
                value: newStatus,
                comment_id: commentID
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        )
    } catch(e) {
        console.log(e);
    }
}


export const postActivityComment = async (activityID, parentID, text, displayOnSuccess) => {
    try {
        const response = await axiosClient.post(`/api/activities/${activityID}/comments/`, 
            {
                text,
                parent: parentID
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        )
        displayOnSuccess(response.data)
    } catch(e) {
        console.log(e);
    }
}