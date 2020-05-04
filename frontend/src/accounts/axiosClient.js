import axios from "axios";

export const axiosClient = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? `${process.env.REACT_APP_PROD_BASE_URL}`
      : `${process.env.REACT_APP_DEV_BASE_URL}`,
});
