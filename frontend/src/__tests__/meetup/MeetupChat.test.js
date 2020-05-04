import React from "react";
import { shallow } from "enzyme";
import { UnderlyingMeetupChat } from "../../components/meetup/MeetupChat";
import WebSocketService from "../../accounts/WebSocket";
import * as mocks from "../../mocks";

jest.mock("../../accounts/WebSocket");

const props = {
  meetup: mocks.meetup.uri,
  messages: [...mocks.messages],
  activeRoom: null,
  setActiveRoom: jest.fn(),
  getMessages: jest.fn(),
  getRoom: jest.fn(),
  addMessage: jest.fn(),
  removeActiveRoom: jest.fn(),
};

describe("MeetupChat unit ", () => {
  const addChatCallbacks = jest.fn(),
    connect = jest.fn(),
    disconnect = jest.fn();

  WebSocketService.mockImplementation(() => {
    return {
      addChatCallbacks,
      connect,
      disconnect,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing given props", () => {
    const wrapper = shallow(<UnderlyingMeetupChat {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("renders and gets info for specific room", () => {
    const wrapper = shallow(<UnderlyingMeetupChat {...props} />);
    expect(props.getRoom.mock.calls.length).toBe(1);
    expect(props.setActiveRoom.mock.calls.length).toBe(1);
    expect(props.getMessages.mock.calls.length).toBe(1);
    expect(addChatCallbacks.mock.calls.length).toBe(1);
    expect(connect.mock.calls.length).toBe(1);
  });

  it("handle componentwillUnmount", () => {
    const wrapper = shallow(<UnderlyingMeetupChat {...props} />);
    wrapper.unmount();
    expect(props.removeActiveRoom.mock.calls.length).toBe(1);
    expect(disconnect.mock.calls.length).toBe(1);
  });
});
