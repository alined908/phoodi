import React from 'react'
import {shallow, mount} from 'enzyme';
import {ChatBarComponent} from "../../components/components" 
import {UnderlyingChatBarComponent} from "../../components/chat/ChatBarComponent"

Date.now = jest.fn(() => new Date(Date.UTC(2017, 1, 14)).valueOf())
const user = {id: 1, email: "example@gmail.com", first_name: "Daniel", last_name: "Lee", avatar: null}
const user2 = {id: 2, email: "example2@gmail.com", first_name: "Bob", last_name: "Jim", avatar: null}
const members = {
    1: user,
    2: user2
}
const rooms = {
    friend: {id: 1, uri: "abc", name: "Friend", timestamp: Date.now(), members: members, friendship: 1, meetup:null, notifs: 0},
    meetup: {id: 2, uri: "xyz", name: "Meetup", timestamp: Date.now(), members: members, friendship: null, meetup:1, notifs: 3}
}

describe("ChatBarComponent unit", () => {

    it ('renders without crashing given props', () => {
        const props = {
            rooms: Object.values(rooms)
        }
        const wrapper = shallow(<UnderlyingChatBarComponent {...props}/>)
        expect(wrapper).toMatchSnapshot()
    })

    it ('correctly displays message when there are no chat rooms', () => {
        const props = {
            rooms: {},
            user: user,
            isRoomsInitialized: true
        }
        const wrapper = shallow(<UnderlyingChatBarComponent {...props}/>)
        expect(wrapper.find(".chat-bar-none")).toHaveLength(1)
    })

    it ('correctly filters out rooms onclick', () => {
        const props = {
            rooms: {},
            user: user,
            isRoomsInitialized: true
        }
        const wrapper = shallow(<UnderlyingChatBarComponent {...props}/>)
        const friendButton = wrapper.find("WithStyles(ForwardRef(IconButton))").first()
        const meetupButton = wrapper.find("WithStyles(ForwardRef(IconButton))").at(1)
        wrapper.setProps({rooms: Object.values(rooms)})
        expect(wrapper.find("Connect(ContactComponent)")).toHaveLength(2)
        friendButton.simulate('click')
        expect(wrapper.find("Connect(ContactComponent)")).toHaveLength(1)
        expect(wrapper.find("Connect(ContactComponent)").first().props().room.includes(rooms.meetup.uri)).toEqual(true)
        friendButton.simulate('click')
        expect(wrapper.find("Connect(ContactComponent)")).toHaveLength(2)
        meetupButton.simulate('click')
        expect(wrapper.find("Connect(ContactComponent)")).toHaveLength(1)
        expect(wrapper.find("Connect(ContactComponent)").first().props().room.includes(rooms.friend.uri)).toEqual(true)
        meetupButton.simulate('click')
        expect(wrapper.find("Connect(ContactComponent)")).toHaveLength(2)
        meetupButton.simulate('click')
        friendButton.simulate('click')
        expect(wrapper.find("Connect(ContactComponent)")).toHaveLength(0)
    })

    it ('correctly filters out rooms onsearch', () => {
        const props = {
            rooms: {},
            user: user,
            isRoomsInitialized: true
        }
        const wrapper = shallow(<UnderlyingChatBarComponent {...props}/>)
        const chatInput = wrapper.find(".chat-input")
        wrapper.setProps({rooms: Object.values(rooms)})
        chatInput.simulate("change", {target: {value: "me"}})
        expect(wrapper.state('searchInput')).toEqual("me")
        expect(wrapper.find("Connect(ContactComponent)")).toHaveLength(1)
        expect(wrapper.find("Connect(ContactComponent)").first().props().room.includes(rooms.meetup.uri)).toEqual(true)
        chatInput.simulate("change", {target: {value: user2.first_name}})
        expect(wrapper.state('searchInput')).toEqual(user2.first_name)
        expect(wrapper.find("Connect(ContactComponent)")).toHaveLength(1)
        expect(wrapper.find("Connect(ContactComponent)").first().props().room.includes(rooms.friend.uri)).toEqual(true)
    })

    it ('correctly filters out rooms onsearch and onclick', () => {
        const props = {
            rooms: {},
            user: user,
            isRoomsInitialized: true
        }
        const wrapper = shallow(<UnderlyingChatBarComponent {...props}/>)
        const friendButton = wrapper.find("WithStyles(ForwardRef(IconButton))").first()
        const meetupButton = wrapper.find("WithStyles(ForwardRef(IconButton))").at(1)
        const chatInput = wrapper.find(".chat-input")
        wrapper.setProps({rooms: Object.values(rooms)})
        chatInput.simulate("change", {target: {value: "me"}})
        expect(wrapper.find("Connect(ContactComponent)")).toHaveLength(1)
        meetupButton.simulate('click')
        expect(wrapper.find("Connect(ContactComponent)")).toHaveLength(0)
        chatInput.simulate("change", {target: {value: user2.first_name}})
        expect(wrapper.state('searchInput')).toEqual(user2.first_name)
        expect(wrapper.state('filters')).toEqual({"friend": false, "meetup": true})
        expect(wrapper.find("Connect(ContactComponent)")).toHaveLength(1)
        friendButton.simulate('click')
        expect(wrapper.find("Connect(ContactComponent)")).toHaveLength(0)
        chatInput.simulate("change", {target: {value: ""}})
        expect(wrapper.find("Connect(ContactComponent)")).toHaveLength(0)
    })
})