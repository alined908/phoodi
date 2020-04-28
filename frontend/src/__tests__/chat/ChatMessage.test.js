import React from 'react'
import {shallow} from 'enzyme';
import {ChatMessage} from "../../components/components"
import {user, message, members, message2} from '../../mocks/index'

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