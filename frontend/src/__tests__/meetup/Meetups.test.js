import React from 'react'
import {shallow, mount} from 'enzyme';
import {UnderlyingMeetups} from "../../components/meetup/Meetups"
import * as mocks from "../../mocks"

const props = {
    user: mocks.user,
    meetups: [mocks.meetup.uri],
    preferences: mocks.preferences,
    isMeetupsFetching: false,
    isMeetupsInitialized: true,
    getMeetups: jest.fn(),
    getPreferences: jest.fn()
}

describe("Meetups tests", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it ('renders without crashing', () => {
        const wrapper = shallow(<UnderlyingMeetups {...props}/>)
        expect(wrapper).toMatchSnapshot()
    })
})