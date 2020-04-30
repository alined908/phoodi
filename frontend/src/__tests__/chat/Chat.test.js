import React from 'react'
import {shallow, mount} from 'enzyme';
import {UnderlyingChat} from "../../components/chat/Chat"
import WebSocketService from "../../accounts/WebSocket";
import * as mocks from "../../mocks"

jest.mock("../../accounts/WebSocket")

const props = {
    messages: [...mocks.messages], 
    rooms: [], 
    match: {params: {}},
    setActiveRoom: jest.fn(),
    getMessages: jest.fn(),
    getRooms: jest.fn(),
    addMessage: jest.fn(),
    removeActiveRoom: jest.fn()
}

describe("Chat unit ", () => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(), // deprecated
          removeListener: jest.fn(), // deprecated
          dispatchEvent: jest.fn(),
        })),
    });

    const addChatCallbacks = jest.fn(), connect = jest.fn(), disconnect = jest.fn(),  exists = jest.fn()
    exists.mockReturnValue(true)
    WebSocketService.mockImplementation(() => {
        return {
            addChatCallbacks,
            connect,
            disconnect,
            exists
        }
    })

    afterEach(() => {
        jest.clearAllMocks();
    });

    it ('renders without crashing given props', () => {
        const wrapper = shallow(<UnderlyingChat {...props}/>)
        expect(wrapper).toMatchSnapshot()
    })

    it ('renders and gets info for specific room', () => {
        const withUri = {...props, match: {params: {uri: "uri"}}}
        const wrapper = shallow(<UnderlyingChat {...withUri}/>)
        expect(props.getRooms.mock.calls.length).toBe(1)
        expect(props.setActiveRoom.mock.calls.length).toBe(1)
        expect(props.getMessages.mock.calls.length).toBe(1)
        expect(addChatCallbacks.mock.calls.length).toBe(1)
        expect(connect.mock.calls.length).toBe(1)
    })

    it ('handle componentDidUpdate', () => {
        const withUri = {...props, match: {params: {uri: "uri"}}}
        const wrapper = shallow(<UnderlyingChat {...withUri}/>)
        wrapper.setProps({match: {params: {uri: "something"}}})
        expect(exists.mock.calls.length).toBe(1)
        expect(disconnect.mock.calls.length).toBe(1)
        expect(props.setActiveRoom.mock.calls.length).toBe(2)
        expect(props.getMessages.mock.calls.length).toBe(2)
    })

    it ('handle componentwillunmount', () => {
        const wrapper = shallow(<UnderlyingChat {...props}/>)
        wrapper.unmount()
        expect(props.removeActiveRoom.mock.calls.length).toBe(1)
        expect(disconnect.mock.calls.length).toBe(1)
    })
})