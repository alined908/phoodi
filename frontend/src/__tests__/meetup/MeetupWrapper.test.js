import React from 'react'
import {shallow} from 'enzyme';
import {UnderlyingMeetupWrapper} from "../../components/meetup/MeetupWrapper"
import * as mocks from "../../mocks"

const props = {
    meetups: mocks.meetups,
    user: mocks.user,
    getMeetup: jest.fn(),
    match: {params: {uri: "uri"}}
}

describe("MeetupWrapper tests", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it ('should render without crashing', () => {
        const wrapper = shallow(<UnderlyingMeetupWrapper {...props}/>)
        expect(wrapper).toMatchSnapshot()
    })

    it ('should render loading and call getMeetup if uri not in meetups', () => {
        const newProps = {...props, match: {params: {uri: "uri3"}}}
        const wrapper = shallow(<UnderlyingMeetupWrapper {...newProps}/>)
        expect(props.getMeetup.mock.calls.length).toBe(1)
        expect(wrapper.find('.loading')).toHaveLength(1)
    })

    it ('should redirect if user is not member and meetup is not public' , () => {
        const newProps = {...props, user: mocks.user3, meetups: mocks.privateMeetup, match: {params: {uri: "uri2"}}}
        const wrapper = shallow(<UnderlyingMeetupWrapper {...newProps}/>)
        expect(wrapper.find("Redirect")).toHaveLength(1)
    })
})