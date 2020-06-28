import * as types from "../constants/action-types";
import { axiosClient } from "../accounts/axiosClient";

export const getActivities = () => async dispatch => {
    try {
        const response = await axiosClient.get("/api/activities/", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        dispatch({ type: types.GET_ACTIVITIES, payload: response.data });
    } catch (e) {
        console.log(e);
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

export const postActivityComment = (activityID, parentID, text) => {
    try {
        axiosClient.post(`/api/activities/${activityID}/comments/`, 
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
    } catch(e) {
        console.log(e);
    }
}