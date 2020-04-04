import axios from 'axios'

export const axiosClient = axios.create({
    baseURL: 
        (process.env.NODE_ENV === 'production') ? 
        'https://phoodie.me':
        `http://localhost:8000`
})