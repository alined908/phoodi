import React from "react";
import { shallow, mount } from "enzyme";
import { UnderlyingChatWindow } from "../../components/chat/ChatWindow";
import { BrowserRouter as Router } from "react-router-dom";
import * as mocks from "../../mocks";

const props = {
  activeRoom: mocks.rooms.friend.uri,
  isMessagesInitialized: true,
  messages: mocks.messages,
  room: mocks.rooms.friend,
  activeChatMembers: mocks.members,
  user: mocks.user,
  socket: {},
};

describe("ChatWindow unit ", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing given props", () => {
    const wrapper = shallow(<UnderlyingChatWindow {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("render loader if fetching state", () => {
    const fetching = {
      ...props,
      isMessagesInitialized: false,
      isMessagesFetching: true,
    };
    const wrapper = shallow(<UnderlyingChatWindow {...fetching} />);
    expect(wrapper.find(".loading")).toHaveLength(1);
  });

  it("shows link to meetup if room is friend", () => {
    const wrapper = shallow(<UnderlyingChatWindow {...props} />);
    expect(wrapper.text()).toContain("Profile");
  });

  it("shows link to user if room is meetup", () => {
    const meetup = {
      ...props,
      room: mocks.rooms.meetup,
      activeRoom: mocks.rooms.meetup.uri,
    };
    const wrapper = shallow(<UnderlyingChatWindow {...meetup} />);
    expect(wrapper.text()).toContain("Meetup");
  });

  it("calls getMoreMessages if isMoreRetrievable", () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    const retrievable = {
      ...props,
      isMoreRetrievable: true,
      getMoreMessages: jest.fn(),
    };
    const wrapper = mount(
      <Router>
        <UnderlyingChatWindow {...retrievable} />
      </Router>
    );
    const instance = wrapper.childAt(0).childAt(0).instance();
    instance.setState({bound: false})
    const event = {
      target: { scrollTop: 0, scrollHeight: 50, clientHeight: 60 },
      persist: jest.fn(),
    };
    wrapper.find(".messagesWrapper").simulate("scroll", event);
    expect(instance.state.offset).toEqual(props.messages[0].id);
    expect(instance.state.bound).toEqual(false);
    expect(instance.props.getMoreMessages.mock.calls.length).toBe(1);
  });

  it("sets bound state if bottom reached", async () => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    const wrapper = mount(
      <Router>
        <UnderlyingChatWindow {...props} />
      </Router>
    );

    const instance = wrapper.childAt(0).childAt(0).instance();
    expect(instance.state.bound).toEqual(true);
    instance.setState({ bound: false });
    const event2 = {
      target: { scrollTop: 50, scrollHeight: 50, clientHeight: 0 },
      persist: jest.fn(),
    };
    wrapper.find(".messagesWrapper").simulate("scroll", event2);

    const instance2 = wrapper.childAt(0).childAt(0).instance();
    expect(instance2.state.bound).toEqual(true);
  });
});
