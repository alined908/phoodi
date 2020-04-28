import moment from 'moment'

export const user = {id: 1, email: "example@gmail.com", first_name: "Daniel", last_name: "Lee", avatar: null}
export const user2 = {id: 2, email: "example2@gmail.com", first_name: "Bob", last_name: "Jim", avatar: null}
export const message = {id: 1, message: "hello", timestamp: moment().format(), room_id: 1, sender: user, is_notif: false}
export const message2 = {id: 2, message: "hello", timestamp: moment().format(), room_id: 1, sender: user, is_notif: true}
export const messages = [message, message2]
export const members = {1: user, 2: user2}

export const rooms = {
    friend: {id: 1, uri: "abc", name: "Room", timestamp: moment().format(), members: members, friendship: 1, meetup:null, notifs: 0},
    meetup: {id: 2, uri: "xyz", name: "Room", timestamp: moment().format(), members: members, friendship: null, meetup:1, notifs: 3}
}

export const room = {uri: {id: 1, uri: "abc", name: "Room", timestamp: moment().format(), members: members, friendship: 1, meetup:null, notifs: 0}}

export const error = {
    message: "Something went wrong."
}