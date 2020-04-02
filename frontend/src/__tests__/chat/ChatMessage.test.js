import React from 'react'
import {shallow} from 'enzyme';
import {ChatMessageComponent} from "../../components/components" 

Date.now = jest.fn(() => new Date(Date.UTC(2017, 1, 14)).valueOf())
const message = {id: 1, message: "hello", timestamp: Date.now(), is_read: false, room_id: 1, sender_id: 1}
const user = {id: 1, email: "example@gmail.com", first_name: "Daniel", last_name: "Lee", avatar: null}
const user2 = {id: 2, email: "example2@gmail.com", first_name: "Bob", last_name: "Jim", avatar: null}
const members = {
    1: user,
    2: user2
}

describe("ChatMessageComponent unit", () => {

    it ('renders without crashing given props', () => {
        const props = {
            message: message,
            user: user,
            members: members
        }
        const wrapper = shallow(<ChatMessageComponent {...props}/>)
        expect(wrapper).toMatchSnapshot()
    })

    it('determines chat message belongs to user', () => {
        const props = {
            message: message,
            user: user,
            members: members
        }
        const wrapper = shallow(<ChatMessageComponent {...props}/>)
        expect(wrapper.find(".is-user")).toHaveLength(4)
    })

    it('determines chat message doesnt belong to user', () => {
        const props = {
            message: message,
            user: user2,
            members: members
        }
        const wrapper = shallow(<ChatMessageComponent {...props}/>)
        expect(wrapper.find(".is-user")).toHaveLength(0)
    })
})