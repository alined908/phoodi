import axios from 'axios'

export const axiosClient = axios.create({
    baseURL: 
        // (process.env.NODE_ENV === 'production') ? 
        // 'https://phoodie.me':
        `${process.env.REACT_APP_BASE_URL}`
})