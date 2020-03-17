import axios from 'axios'

export const axiosClient = axios.create({
    baseURL: 
        // (process.env.NODE_ENV === 'production') ? 
        // 'http://ec2-54-67-104-152.us-west-1.compute.amazonaws.com':
        `${process.env.REACT_APP_BASE_URL}`
})