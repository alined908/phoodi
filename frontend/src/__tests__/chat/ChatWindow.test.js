import React from 'react'
import {shallow, mount} from 'enzyme';
import {ChatWindowComponent} from "../../components/components" 
import {UnderlyingChatWindowComponent} from "../../components/chat/ChatWindowComponent"

Date.now = jest.fn(() => new Date(Date.UTC(2017, 1, 14)).valueOf())
const user = {id: 1, email: "example@gmail.com", first_name: "Daniel", last_name: "Lee", avatar: null}
const user2 = {id: 2, email: "example2@gmail.com", first_name: "Bob", last_name: "Jim", avatar: null}
const members = {1: user,2: user2}
const rooms = {
    friend: {id: 1, uri: "abc", name: "Friend", timestamp: Date.now(), members: members, friendship: 1, meetup:null, notifs: 0},
    meetup: {id: 2, uri: "xyz", name: "Meetup", timestamp: Date.now(), members: members, friendship: null, meetup:1, notifs: 3}
}
const message = {id: 1, message: "hello", timestamp: Date.now(), is_read: false, room_id: 1, sender_id: 1}
const message2 = {id: 1, message: "hello", timestamp: Date.now(), is_read: false, room_id: 1, sender_id: 1}
const messages = [message, message2]


describe("", () => {

    it('renders without crashing given props', () => {
        const props = {
            activeRoom: rooms.friend.uri,
            isMessagesInitialized: true,
            messages: messages,
            room: rooms.friend,
            activeChatMembers: members,
            user: user
        }

        const wrapper = shallow(<UnderlyingChatWindowComponent {...props}/>)
        expect(wrapper).toMatchSnapshot()
    })
})