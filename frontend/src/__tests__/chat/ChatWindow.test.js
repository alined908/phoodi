import React from 'react'
import {shallow} from 'enzyme';
import {ChatWindow} from "../../components/components" 
import {UnderlyingChatWindow} from "../../components/chat/ChatWindow"
import {user, members, rooms, messages} from "../../mocks/index"

describe("ChatWindow unit ", () => {

    it('renders without crashing given props', () => {
        const props = {
            activeRoom: rooms.friend.uri,
            isMessagesInitialized: true,
            messages: messages,
            room: rooms.friend,
            activeChatMembers: members,
            user: user,
            socket: {}
        }
        const wrapper = shallow(<UnderlyingChatWindow {...props}/>)
        expect(wrapper).toMatchSnapshot()
    })

    it ("shows link to meetup if room is friend" , () => {
        const props = {
            activeRoom: rooms.friend.uri,
            isMessagesInitialized: true,
            messages: messages,
            room: rooms.friend,
            activeChatMembers: members,
            user: user,
            socket: {}
        }
        const wrapper = shallow(<UnderlyingChatWindow {...props}/>)
        expect(wrapper.text()).toContain('Profile')
    })

    it ("shows link to user if room is meetup" , () => {
        const props = {
            activeRoom: rooms.meetup.uri,
            isMessagesInitialized: true,
            messages: [],
            room: rooms.meetup,
            activeChatMembers: members,
            user: user,
            socket: {}
        }
        const wrapper = shallow(<UnderlyingChatWindow {...props}/>)
        expect(wrapper.text()).toContain('Meetup')
    })
})