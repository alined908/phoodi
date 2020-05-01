import React from 'react'
import {shallow} from 'enzyme';
import {UnderlyingMeetupEvent} from "../../components/meetup/MeetupEvent"
import * as mocks from "../../mocks"

const props = {
    user: mocks.user,
    event: mocks.event[1],
    number: 1,
    socket: {
        deleteMeetupEvent: jest.fn(),
        reloadMeetupEvent: jest.fn(),
        decideMeetupEvent: jest.fn(),
        redecideMeetupEvent: jest.fn(),
        addEventOption: jest.fn(),
    },
    uri: mocks.meetup.uri.uri,
    coords: {latitude: 32.22, longitude: 32.33},
    deleteMeetupEvent: jest.fn(),
    addGlobalMessage: jest.fn(),
    chosen: false,
    isUserMember: true
}

describe("MeetupEvent tests general", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it ('renders without crashing', () => {
        const wrapper = shallow(<UnderlyingMeetupEvent {...props}/>)
        expect(wrapper).toMatchSnapshot()
    })

    it('opens form modal onclick', () => {
        const wrapper = shallow(<UnderlyingMeetupEvent {...props}/>)
        expect(wrapper.state('editMeetupEventForm')).toBe(false)
        expect(wrapper.find("MeetupEventForm")).toHaveLength(0)
        const button = wrapper.find('[aria-label="edit"]')
        button.simulate('click')
        expect(wrapper.state('editMeetupEventForm')).toBe(true)
    })

    it('should handle search value click if restaurant doesnt already exist as option', () => {
        const newProps = {...props, event: {...mocks.event[1], options: mocks.options}}
        const wrapper = shallow(<UnderlyingMeetupEvent {...newProps}/>)
        wrapper.setState({searchInput: "food"})
        wrapper.instance().handleSearchValueClick({}, {id: "rst2"})
        expect(props.addGlobalMessage.mock.calls.length).toBe(1)
        expect(props.socket.addEventOption.mock.calls.length).toBe(1)
        expect(wrapper.state("searchInput")).toBe("")
    })

    it('should handle search value click if restaurant already exist as option', () => {
        const newProps = {...props, event: {...mocks.event[1], options: mocks.options}}
        const wrapper = shallow(<UnderlyingMeetupEvent {...newProps}/>)
        wrapper.setState({searchInput: "food"})
        wrapper.instance().handleSearchValueClick({}, {id: "rst"})
        expect(props.addGlobalMessage.mock.calls.length).toBe(1)
        expect(props.socket.addEventOption.mock.calls.length).toBe(0)
        expect(wrapper.state("searchInput")).toBe("")
    })
})

describe("MeetupEvent tests not chosen", () => {
    window.confirm = jest.fn(() => true)

    afterEach(() => {
        jest.clearAllMocks();
    });

    it ('shows reload button and sends action on click', () => {
        const wrapper = shallow(<UnderlyingMeetupEvent {...props}/>)
        const button = wrapper.find('ProgressIcon')
        expect(button).toHaveLength(1)
        wrapper.instance().handleReload()
        expect(props.socket.reloadMeetupEvent.mock.calls.length).toBe(1)
    })

    it('shows add option action and shows searchbar onclick', () => {
        const wrapper = shallow(<UnderlyingMeetupEvent {...props}/>)
        const button = wrapper.find('[aria-label="add-option"]')
        expect(button).toHaveLength(1)
        button.simulate('click')
        expect(wrapper.state("searchOpen")).toBe(true)
        expect(wrapper.find(".addOptionSearch")).toHaveLength(1)
    })

    it ('shows reload button and sends action on click', () => {
        const wrapper = shallow(<UnderlyingMeetupEvent {...props}/>)
        const button = wrapper.find('[aria-label="delete"]')
        expect(button).toHaveLength(1)
        button.simulate('click')
        expect(props.socket.deleteMeetupEvent.mock.calls.length).toBe(1)
    })

    it ('if there are no options doesnt show decide and random and displays helper text', () => {
        const wrapper = shallow(<UnderlyingMeetupEvent {...props}/>)
        const decideButton = wrapper.find('[aria-label="decide"]')
        expect(decideButton).toHaveLength(0)
        const randomButton = wrapper.find('[aria-label="random"]')
        expect(randomButton).toHaveLength(0)
        expect(wrapper.find(".explanation").text()).toContain("No options available.")
    })

    it ('shows decide and random buttons and sends actions on click if options exist', () => {
        const newProps = {...props, event: {...mocks.event[1], options: mocks.options}}
        const wrapper = shallow(<UnderlyingMeetupEvent {...newProps}/>)
        const decideButton = wrapper.find('[aria-label="decide"]')
        expect(decideButton).toHaveLength(1)
        decideButton.simulate('click')
        expect(props.socket.decideMeetupEvent.mock.calls.length).toBe(1)
        const randomButton = wrapper.find('[aria-label="random"]')
        expect(randomButton).toHaveLength(1)
        randomButton.simulate('click')
        expect(props.socket.decideMeetupEvent.mock.calls.length).toBe(2)
    })
})

describe("MeetupEvent tests chosen", () => {
    const newProps = {...props, chosen: 1, event: {...mocks.event[1], options: mocks.options}}

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render option and map', () => {
        const wrapper = shallow(<UnderlyingMeetupEvent {...newProps}/>)
        expect(wrapper.find("Map")).toHaveLength(1)
        expect(wrapper.find("Connect(MeetupEventOption)")).toHaveLength(1)
    })

    it ('should show redecide button and send event onclick', () => {
        const wrapper = shallow(<UnderlyingMeetupEvent {...newProps}/>)
        const redecideButton = wrapper.find('[aria-label="redecide"]')
        expect(redecideButton).toHaveLength(1)
        redecideButton.simulate('click')
        expect(props.socket.redecideMeetupEvent.mock.calls.length).toBe(1)
    })
})