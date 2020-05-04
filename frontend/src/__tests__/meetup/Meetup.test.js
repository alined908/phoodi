import React from "react";
import { shallow, mount } from "enzyme";
import Meetup, { UnderlyingMeetup } from "../../components/meetup/Meetup";
import WebSocketService from "../../accounts/WebSocket";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import * as mocks from "../../mocks";
import setupStore from "../../setupTests";

jest.mock("../../accounts/WebSocket");

const props = {
  meetup: mocks.meetup.uri,
  user: mocks.user,
  friends: mocks.friends,
  isFriendInitialized: false,
  isMeetupEventsFetching: true,
  isMeetupEventsInitialized: false,
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
  deleteMeetupMember: jest.fn(),
  handlePublicMeetupJoin: jest.fn(),
  handleLeaveMeetup: jest.fn(),
};

describe("Meetup tests general", () => {
  const addMeetupCallbacks = jest.fn(),
    connect = jest.fn(),
    disconnect = jest.fn(),
    addChatCallbacks = jest.fn();
  window.confirm = jest.fn(() => true);

  WebSocketService.mockImplementation(() => {
    return {
      addMeetupCallbacks,
      connect,
      disconnect,
      addChatCallbacks,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing given props", () => {
    const wrapper = shallow(<UnderlyingMeetup {...props} />);
    expect(addMeetupCallbacks.mock.calls.length).toBe(1);
    expect(wrapper).toMatchSnapshot();
  });

  it("should connect to socket and get relevant info", () => {
    const wrapper = shallow(<UnderlyingMeetup {...props} />);
    expect(connect.mock.calls.length).toBe(1);
    expect(props.getMeetupEvents.mock.calls.length).toBe(1);
    expect(props.getFriends.mock.calls.length).toBe(1);
    expect(props.removeNotifs.mock.calls.length).toBe(0);
  });

  it("should disconnect socket on unmount", () => {
    const wrapper = shallow(<UnderlyingMeetup {...props} />);
    wrapper.unmount();
    expect(disconnect.mock.calls.length).toBe(1);
  });

  it("should show location of meetup", () => {
    const wrapper = shallow(<UnderlyingMeetup {...props} />);
    const location = wrapper.find('[aria-label="location"]');
    expect(location).toHaveLength(1);
    expect(location.text()).toContain("location");
  });

  it("should show fetching state if meetupeventsfetching", () => {
    const wrapper = shallow(<UnderlyingMeetup {...props} />);
    expect(wrapper.find(".loading")).toHaveLength(1);
  });

  it("should show meetup events if meetupsevents not fetchng and initialized", () => {
    const newProps = {
      ...props,
      meetup: { ...props.meetup, events: { ...mocks.events } },
      isMeetupEventsFetching: false,
      isMeetupEventsInitialized: true,
    };
    const wrapper = shallow(<UnderlyingMeetup {...newProps} />);
    expect(wrapper.find(".loading")).toHaveLength(0);
    expect(wrapper.find("Connect(MeetupEvent)")).toHaveLength(1);
  });
});

describe("Meetup tests where user is creator", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should send deleteMeetup action if button clicked", () => {
    const wrapper = shallow(<UnderlyingMeetup {...props} />);
    const button = wrapper.find('[aria-label="delete"]');
    button.simulate("click");
    expect(props.deleteMeetup.mock.calls.length).toBe(1);
  });

  // it('should handle disabled email if button is clicked', () => {

  //     const store = setupStore()
  //     const wrapper = mount(
  //         <Provider store={store}>
  //             <Router>
  //                 <UnderlyingMeetup {...props}/>
  //             </Router>
  //         </Provider>
  //     )
  //     const emailButton = wrapper.find('ProgressIcon')
  //     console.log(wrapper.debug())
  //     expect(emailButton).toHaveLength(1)
  //     emailButton.click()
  //     expect(props.addGlobalMessage.mock.calls.length).toBe(1)
  // })

  // it('should handle email if events exist and are chosen and button is clicked', () => {
  //     const newProps = {...props, meetup: {...props.meetup, events: {...mocks.chosenEvent}}}
  //     const wrapper = shallow(<UnderlyingMeetup {...newProps}/>)
  //     const emailButton = wrapper.find('ProgressIcon')
  //     expect(emailButton).toHaveLength(1)
  //     emailButton.click()
  //     expect(props.sendMeetupEmails.mock.calls.length).toBe(1)
  // })

  it("should show edit meetup button and open form modal when clicked", () => {
    const wrapper = shallow(<UnderlyingMeetup {...props} />);
    expect(wrapper.state("editMeetupForm")).toBe(false);
    expect(wrapper.find('[aria-label="meetup-form"]')).toHaveLength(0);
    const editButton = wrapper.find('[aria-label="edit"]');
    expect(editButton).toHaveLength(1);
    editButton.simulate("click");
    expect(wrapper.state("editMeetupForm")).toBe(true);
    expect(wrapper.find('[aria-label="meetup-form"]')).toHaveLength(1);
  });
});

describe("Meetup tests where user is member", () => {
  const setup = () => {
    const newProps = { ...props, isUserMember: true };
    const wrapper = shallow(<UnderlyingMeetup {...newProps} />);
    return wrapper;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should hide chat button on initial render", () => {
    const wrapper = setup();
    const button = wrapper.find('[aria-label="chat"]');
    expect(button).toHaveLength(0);
  });

  it("should show friend refresh button and send action", () => {
    const wrapper = setup();
    expect(props.getFriends.mock.calls.length).toBe(1);
    const button = wrapper.find('[aria-label="refresh-friends"]');
    expect(button).toHaveLength(1);
    button.simulate("click");
    expect(props.getFriends.mock.calls.length).toBe(2);
  });

  it("should hide chat if togglechat is called", () => {
    const wrapper = setup();
    expect(wrapper.find('[aria-label="meetup-chat"]')).toHaveLength(1);
    wrapper.setState({ showChat: false });
    expect(wrapper.find('[aria-label="meetup-chat"]')).toHaveLength(0);
  });

  it("should show new event button and open form modal when clicked", () => {
    const wrapper = setup();
    expect(wrapper.state("newMeetupEventForm")).toBe(false);
    expect(wrapper.find('[aria-label="add-event-form"]')).toHaveLength(0);
    const addButton = wrapper.find('[aria-label="add-event"]');
    expect(addButton).toHaveLength(1);
    addButton.simulate("click");
    expect(wrapper.state("newMeetupEventForm")).toBe(true);
    expect(wrapper.find('[aria-label="add-event-form"]')).toHaveLength(1);
  });

  it("should handle leave meetup", () => {
    const newProps = { ...props, isUserMember: true, user: mocks.user2 };
    const wrapper = shallow(<UnderlyingMeetup {...newProps} />);
    const leaveMeetupButton = wrapper.find('[aria-label="leave-meetup"]');
    expect(leaveMeetupButton).toHaveLength(1);
    leaveMeetupButton.simulate("click", { stopPropagation: () => undefined });
    expect(props.handleLeaveMeetup.mock.calls.length).toBe(1);
  });
});

describe("Meetup tests where user is not member", () => {
  const setup = () => {
    const newProps = { ...props, isUserMember: false };
    const wrapper = shallow(<UnderlyingMeetup {...newProps} />);
    return wrapper;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should show join meetup button and send action on click", () => {
    const wrapper = setup();
    const button = wrapper.find('[aria-label="join-meetup"]');
    expect(button).toHaveLength(1);
    button.simulate("click");
    expect(props.handlePublicMeetupJoin.mock.calls.length).toBe(1);
  });

  it("should not show meetup chat", () => {
    const wrapper = setup();
    const chat = wrapper.find('[aria-label="meetup-chat"]');
    expect(chat).toHaveLength(0);
  });

  it("should not show member only buttons", () => {
    const wrapper = setup();
    const openChatButton = wrapper.find('[aria-label="chat"]');
    expect(openChatButton).toHaveLength(0);
    const leaveMeetupButton = wrapper.find('[aria-label="leave-meetup"]');
    expect(leaveMeetupButton).toHaveLength(0);
    const addEventButton = wrapper.find('[aria-label="leave-meetup"]');
    expect(addEventButton).toHaveLength(0);
  });
});

describe("Meetup tests where meetup is public", () => {
  const setup = () => {
    const wrapper = shallow(<UnderlyingMeetup {...props} />);
    return wrapper;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should show PublicIcon button", () => {
    const wrapper = setup();
    const status = wrapper.find('[aria-label="meetup-type"]');
    expect(status).toHaveLength(1);
    expect(status.text()).toContain("Public");
  });
});

describe("Meetup tests where meetup is private", () => {
  const setup = () => {
    const newProps = { ...props, meetup: mocks.privateMeetup.uri2 };
    const wrapper = shallow(<UnderlyingMeetup {...newProps} />);
    return wrapper;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should show PrivateIcon button", () => {
    const wrapper = setup();
    const status = wrapper.find('[aria-label="meetup-type"]');
    expect(status).toHaveLength(1);
    expect(status.text()).toContain("Private");
  });
});
