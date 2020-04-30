import moment from 'moment'

//Category
export const category = {
    id: 1, 
    image: null,
    label: "Dessert", 
    api_label: "desserts"
}

//User
export const user = {
    id: 1, 
    email: "daniel@gmail.com", 
    first_name: "Daniel", 
    last_name: "Lee",
    avatar: null
}
export const user2 = {
    id: 2, 
    email: "example2@gmail.com", 
    first_name: "Bob", 
    last_name: "Jim", 
    avatar: null
}
export const user3 = {
    id: 3, 
    email: "example3@gmail.com", 
    first_name: "Bob", 
    last_name: "Jim", 
    avatar: null
}
export const settings = {
    radius: 25, 
    location: null, 
    latitude: null,
    longitude: null
}

export const userWithSettings = {
    ...user,
    settings: {...settings}
}
export const friend = {
    id: 1, 
    user: user2, 
    created_at: moment().format(), 
    chat_room: "something"
}
export const friends = [friend]
export const preference = {
    id: 1, 
    user, 
    category, 
    name: "Dessert", 
    ranking: 1, 
    timestamp: moment().format()
}
export const preferences = [preference]
export const friendInvite = {
    id: 1, 
    timestamp: moment().format(), 
    status: 1, 
    uri: "random", 
    sender: user, 
    receiver: user2
}

//Chat
export const message = {
    id: 1, 
    message: "hello", 
    timestamp: moment().format(), 
    room_id: 1, 
    sender: user, 
    is_notif: false
}
export const message2 = {
    id: 2, 
    message: "hello", 
    timestamp: moment().format(), 
    room_id: 1, 
    sender: user, 
    is_notif: true
}
export const messages = [message, message2]
export const members = {1: user, 2: user2}
export const room = {
    uri: {
        id: 1, 
        uri: "abc", 
        name: "Room", 
        timestamp: moment().format(), 
        members: members, 
        friendship: 1, 
        meetup:null, 
        notifs: 0
    }
}
export const rooms = {
    friend: {
        id: 1, 
        uri: "abc", 
        name: "Room", 
        timestamp: moment().format(), 
        members: members, 
        friendship: 1, 
        meetup:null, 
        notifs: 0
    },
    meetup: {
        id: 2, 
        uri: "xyz", 
        name: "Room", 
        timestamp: moment().format(), 
        members: members, 
        friendship: null, 
        meetup:1, 
        notifs: 3
    }
}

//General
export const error = {
    message: "Something went wrong."
}

//Meetup
export const meetupMember1 = {
    1: {
        id: 1,
        user,
        ban: false,
        admin: true
    }
}

export const meetupMember2 = {
    2: {
        id: 2,
        user: user2,
        ban: false,
        admin: false
    }
}

export const meetupMember3 = {
    3: {
        id: 3,
        user: user3,
        ban: false,
        admin: false
    }
}

export const meetupMembers = {...meetupMember1, ...meetupMember2}

export const meetup = {
    uri: {
        id: 1, 
        name: "Meetup", 
        uri: "uri", 
        creator: user, 
        location: "location", 
        date: moment().format("YYYY-MM-DD"),
        members: meetupMembers,
        notifs: 0,
        public: true,
        categories: [category],
        latitude: 34.228754, 
        longitude: -118.2351192,
        events: {},
        isMeetupEventsInitialized : true
    }
}

export const meetups = {...meetup}

export const event = {
    1: {
        id: 1,
        meetup: 1,
        creator: user,
        title: "Dessert",
        start: moment().format(),
        end: moment().format(),
        chosen: null,
        categories: [category],
        options: {},
        price: "1, 2",
        distance: 16000,
        entries: {},
        random: true
    }
}
export const events = {...event}

export const option = {
    1 : {
        id: 1,
        score: 0,
        option: null,
        restaurant: {},
        votes: {},
        banned: false
    }
}

export const options = {...option}

export const tokens = {
    access: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNTg4MjI5OTEzLCJqdGkiOiIwOTg2YTg0MDA1ZGM0OGQ1ODEzYmIyNzE1OWViNGUyZCIsInVzZXJfaWQiOjEsInVzZXIiOnsiaWQiOjEsImVtYWlsIjoiZGFuaWVsQGdtYWlsLmNvbSIsImZpcnN0X25hbWUiOiJEYW5pZWwiLCJsYXN0X25hbWUiOiJMZWUiLCJhdmF0YXIiOm51bGwsInNldHRpbmdzIjp7InJhZGl1cyI6MjUsImxvY2F0aW9uIjpudWxsLCJsYXRpdHVkZSI6bnVsbCwibG9uZ2l0dWRlIjpudWxsfX19.FbffRthOKX5F0TGvqA5mZXuXUWNkUojzKexDGCoP518",
    refresh : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTU4ODM4Mjk0NiwianRpIjoiN2ZhNGY2MDE4OWM3NDA5ZmFjOTMwYmE4ZTRlMWFhMTMiLCJ1c2VyX2lkIjoxLCJ1c2VyIjp7ImlkIjoxLCJlbWFpbCI6ImRhbmllbEBnbWFpbC5jb20iLCJmaXJzdF9uYW1lIjoiRGFuaWVsIiwibGFzdF9uYW1lIjoiTGVlIiwiYXZhdGFyIjpudWxsLCJzZXR0aW5ncyI6eyJyYWRpdXMiOjI1LCJsb2NhdGlvbiI6bnVsbCwibGF0aXR1ZGUiOm51bGwsImxvbmdpdHVkZSI6bnVsbH19fQ.qqaY4Ye7rmyOKLbDS2EKz4SGWH0fwZ0MvrGP6NJ3IRE"
}