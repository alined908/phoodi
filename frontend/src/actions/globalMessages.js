import {
  ADD_GLOBAL_MESSAGE,
  REMOVE_GLOBAL_MESSAGE,
} from "../constants/action-types";

export const addGlobalMessage = (type, message) => {
  return {
    type: ADD_GLOBAL_MESSAGE,
    payload: { type: type, message: message },
  };
};

export const removeGlobalMessage = () => {
  return {
    type: REMOVE_GLOBAL_MESSAGE,
  };
};
