import React from 'react'
import {shallow} from 'enzyme';
import {ContactComponent} from "../../components/components" 
import {UnderlyingContactComponent} from "../../components/chat/ContactComponent"

Date.now = jest.fn(() => new Date(Date.UTC(2017, 1, 14)).valueOf())
const user = {id: 1, email: "example@gmail.com", first_name: "Daniel", last_name: "Lee", avatar: null}
const user2 = {id: 2, email: "example2@gmail.com", first_name: "Bob", last_name: "Jim", avatar: null}
const members = {
    1: user,
    2: user2
}
const rooms = {
    friend: {id: 1, uri: "abc", name: "Room", timestamp: Date.now(), members: members, friendship: 1, meetup:null, notifs: 0},
    meetup: {id: 2, uri: "xyz", name: "Room", timestamp: Date.now(), members: members, friendship: null, meetup:1, notifs: 3}
}


describe("ContactComponent unit", () => {

    it ('renders without crashing given props', () => {
        const props = {
            user: user,
            room: Object.values(rooms.friend)
        }
        const wrapper = shallow(<UnderlyingContactComponent {...props}/>)
        expect(wrapper).toMatchSnapshot()
    })

    it ('determines if contact is friend', () => {
        const props = {
            user: user,
            room: Object.values(rooms.friend)
        }

        const wrapper = shallow(<UnderlyingContactComponent {...props}/>)
        expect(wrapper.find(".chat-contact-info")).toHaveLength(1)
        expect(wrapper.find(".meetup-avatars")).toHaveLength(0)
    })

    it ('determines if contact is meetup', () => {
        const props = {
            user: user,
            room: Object.values(rooms.meetup)
        }

        const wrapper = shallow(<UnderlyingContactComponent {...props}/>)
        expect(wrapper.find(".chat-contact-info")).toHaveLength(0)
        expect(wrapper.find(".meetup-avatars")).toHaveLength(1)
    })

    it ('determines if contact is current room', () => {
        const props = {
            user: user,
            room: Object.values(rooms.friend),
            currentRoom: "abc"
        }
        const wrapper = shallow(<UnderlyingContactComponent {...props}/>)
        expect(wrapper.find(".curr-room")).toHaveLength(1)
    })

    it ('determines if contact is not current room', () => {
        const props = {
            user: user,
            room: Object.values(rooms.friend),
            currentRoom: "xyz"
        }
        const wrapper = shallow(<UnderlyingContactComponent {...props}/>)
        expect(wrapper.find(".curr-room")).toHaveLength(0)
    })

    it ('renders notifications', () => {
        const props = {
            user: user,
            room: Object.values(rooms.meetup),
            currentRoom: "abc",
            removeNotifs: jest.fn()
        }
        const wrapper = shallow(<UnderlyingContactComponent {...props}/>)
        expect(wrapper.state('notifs')).toEqual(3)
        wrapper.find('.contact-link').simulate('click')
        expect(wrapper.state('notifs')).toEqual(0)
    })
})