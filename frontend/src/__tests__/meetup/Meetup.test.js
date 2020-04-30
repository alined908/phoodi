import React from 'react'
import {shallow, mount} from 'enzyme';
import {UnderlyingMeetup} from "../../components/meetup/Meetup"
import WebSocketService from "../../accounts/WebSocket";
import { BrowserRouter as Router } from 'react-router-dom';
import {Provider} from 'react-redux'
import * as mocks from "../../mocks"
import setupStore from "../../setupTests"

jest.mock("../../accounts/WebSocket")

const props = {
    meetup: mocks.meetup.uri,
    user: mocks.user,
    friends: mocks.friends,
    isFriendInitialized: false,
    deleteMeetup: jest.fn(),
    getFriends: jest.fn(), 
    getMeetupEvents: jest.fn(), 
    addMeetupEvent: jest.fn(),
    reloadMeetupEvent: jest.fn(),
    voteMeetupEvent: jest.fn(),
    decideMeetupEvent: jest.fn(),
    deleteMeetupEvent: jest.fn(),
    sendMeetupEmails: jest.fn(),
    removeNotifs: jest.fn(),
    addMeetupMember: jest.fn(),
    addGlobalMessage: jest.fn(),
    addEventOption: jest.fn(),
    sendFriendInvite: jest.fn(),
    deleteEventOption: jest.fn(),
    deleteMeetupMember: jest.fn()
}

describe("Meetup tests general", () => {

    const addMeetupCallbacks = jest.fn(), connect = jest.fn(), disconnect = jest.fn(), addChatCallbacks = jest.fn()
    window.confirm = jest.fn(() => true)

    WebSocketService.mockImplementation(() => {
        return {
            addMeetupCallbacks,
            connect,
            disconnect,
            addChatCallbacks
        }
    })

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders without crashing given props", () => {
        const wrapper = shallow(<UnderlyingMeetup {...props}/>)
        expect(addMeetupCallbacks.mock.calls.length).toBe(1)
        expect(wrapper).toMatchSnapshot()
    })

    it("should connect to socket and get relevant info", () => {
        const wrapper = shallow(<UnderlyingMeetup {...props}/>)
        expect(connect.mock.calls.length).toBe(1)
        expect(props.getMeetupEvents.mock.calls.length).toBe(1)
        expect(props.getFriends.mock.calls.length).toBe(1)
        expect(props.removeNotifs.mock.calls.length).toBe(0)
    })

    it ('should disconnect socket on unmount', () => {
        const wrapper = shallow(<UnderlyingMeetup {...props}/>)
        wrapper.unmount()
        expect(disconnect.mock.calls.length).toBe(1)
    })
})

describe("Meetup tests where user is creator", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it ('should send deleteMeetup action if button clicked', () => {
        const wrapper = shallow(<UnderlyingMeetup {...props}/>)
        const button = wrapper.find('[aria-label="delete"]')
        button.simulate('click')
        expect(props.deleteMeetup.mock.calls.length).toBe(1)
    })

    it('should send sendMeetupEmails action if button is clicked', () => {
        const wrapper = shallow(
            <UnderlyingMeetup {...props}/>
        )
        const emailButton = wrapper.find('ProgressIcon')
        expect(emailButton).toHaveLength(1)
    })
})

describe("Meetup tests where user is member", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it ('should hide chat button on initial render', () => {
        const newProps = {...props, isUserMember: true}
        const wrapper = shallow(
            <UnderlyingMeetup {...newProps}/>
        )
        const button = wrapper.find('[aria-label="chat"]')
        expect(button).toHaveLength(0)
    })

})

describe("Meetup tests where user is not member", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

})