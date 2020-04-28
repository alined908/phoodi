import React from 'react'
import {shallow} from 'enzyme';
import {ChatMessage} from "../../components/components"
import moment from 'moment'
import styles from '../../styles/chat.module.css'

Date.now = jest.fn(() => new Date(Date.UTC(2017, 1, 14)).valueOf())
const user = {id: 1, email: "example@gmail.com", first_name: "Daniel", last_name: "Lee", avatar: null}
const user2 = {id: 2, email: "example2@gmail.com", first_name: "Bob", last_name: "Jim", avatar: null}
const message = {id: 1, message: "hello", timestamp: moment().format(), room_id: 1, sender: user, is_notif: false}
const message2 = {id: 2, message: "hello", timestamp: moment().format(), room_id: 1, sender: user, is_notif: true}
const members = {1: user, 2: user2}

const setUp = (message, user) => {
    const props = {user, message, members}
    const wrapper = shallow(<ChatMessage {...props}/>)
    return wrapper
}

describe("ChatMessage", () => {

    it ('Should render chat message without errors', () => {
        const wrapper = setUp(message, user)
        expect(wrapper).toMatchSnapshot()
    })

    it('Should render a notification if if_notif is True', () => {
        const wrapper = setUp(message2, user)
        expect(wrapper.hasClass('messageNotifWrapper')).toEqual(true)
    })

    it ('Should not render a notification if if_notif is False', () => {
        const wrapper = setUp(message, user)
        expect(wrapper.hasClass('messageWrapper')).toEqual(true)
    })
})