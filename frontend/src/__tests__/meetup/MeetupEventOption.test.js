import React from 'react'
import {shallow, mount} from 'enzyme';
import {UnderlyingMeetupEventOption} from "../../components/meetup/MeetupEventOption"
import * as mocks from "../../mocks"


describe("MeetupWrapper tests", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it ('should render without crashing', () => {
        const wrapper = shallow(<UnderlyingMeetupEventOption {...props}/>)
        expect(wrapper).toMatchSnapshot()
    })

})