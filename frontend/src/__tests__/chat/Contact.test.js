import React from 'react'
import {shallow} from 'enzyme';
import {ContactComponent} from "../../components/components" 
import {UnderlyingContactComponent} from "../../components/chat/ContactComponent"
import {user, rooms} from '../../mocks/index'

describe("ContactComponent unit", () => {

    it ('renders without crashing given props', () => {
        const props = {
            user: user,
            room: rooms.friend
        }
        const wrapper = shallow(<UnderlyingContactComponent {...props}/>)
        expect(wrapper).toMatchSnapshot()
    })

    it ('determines if contact is friend', () => {
        const props = {
            user: user,
            room: rooms.friend
        }

        const wrapper = shallow(<UnderlyingContactComponent {...props}/>)
        expect(wrapper.find(".chat-contact-info")).toHaveLength(1)
        expect(wrapper.find(".meetup-avatars")).toHaveLength(0)
    })

    it ('determines if contact is meetup', () => {
        const props = {
            user: user,
            room: rooms.meetup
        }

        const wrapper = shallow(<UnderlyingContactComponent {...props}/>)
        expect(wrapper.find(".chat-contact-info")).toHaveLength(0)
        expect(wrapper.find(".meetup-avatars")).toHaveLength(1)
    })

    it ('determines if contact is current room', () => {
        const props = {
            user: user,
            room: rooms.friend,
            currentRoom: "abc"
        }
        const wrapper = shallow(<UnderlyingContactComponent {...props}/>)
        expect(wrapper.find(".curr-room")).toHaveLength(1)
    })

    it ('determines if contact is not current room', () => {
        const props = {
            user: user,
            room: rooms.friend,
            currentRoom: "xyz"
        }
        const wrapper = shallow(<UnderlyingContactComponent {...props}/>)
        expect(wrapper.find(".curr-room")).toHaveLength(0)
    })

    it ('renders and removes notifications', () => {
        const props = {
            user: user,
            room: rooms.meetup,
            currentRoom: "abc",
            removeNotifs: jest.fn()
        }
        const wrapper = shallow(<UnderlyingContactComponent {...props}/>)
        expect(wrapper.state('notifs')).toEqual(3)
        wrapper.find('.contact-link').simulate('click')
        expect(wrapper.state('notifs')).toEqual(0)
    })
})