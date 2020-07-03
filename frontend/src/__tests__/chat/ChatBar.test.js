import React from "react";
import { shallow } from "enzyme";
import { UnderlyingChatBar } from "../../components/chat/ChatBar";
import { user, user2, rooms } from "../../mocks/index";

describe("ChatBar unit", () => {
  it("renders without crashing given props", () => {
    const props = {
      rooms: Object.values(rooms),
    };
    const wrapper = shallow(<UnderlyingChatBar {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("render loader if fetching", () => {
    const props = {
      rooms: Object.values(rooms),
      isRoomsInitialized: false,
      isRoomsFetching: true,
    };
    const wrapper = shallow(<UnderlyingChatBar {...props} />);
    expect(wrapper.find(".loading")).toHaveLength(1);
  });

  it("correctly displays message when there are no chat rooms", () => {
    const props = {
      rooms: [],
      user: user,
      isRoomsInitialized: true,
    };
    const wrapper = shallow(<UnderlyingChatBar {...props} />);
    expect(wrapper.find(".no-entity")).toHaveLength(1);
  });

  it("correctly filters out rooms onclick", () => {
    const props = {
      rooms: [],
      user: user,
      isRoomsInitialized: true,
    };
    const wrapper = shallow(<UnderlyingChatBar {...props} />);
    const friendButton = wrapper
      .find("WithStyles(ForwardRef(IconButton))")
      .first();
    const meetupButton = wrapper
      .find("WithStyles(ForwardRef(IconButton))")
      .at(1);
    wrapper.setProps({ rooms: Object.values(rooms) });
    console.log(wrapper.debug())
    expect(wrapper.find("Contact")).toHaveLength(2);
    friendButton.simulate("click");
    expect(wrapper.find("Contact")).toHaveLength(1);
    expect(wrapper.find("Contact").first().props().room.uri).toEqual(
      rooms.meetup.uri
    );
    friendButton.simulate("click");
    expect(wrapper.find("Contact")).toHaveLength(2);
    meetupButton.simulate("click");
    expect(wrapper.find("Contact")).toHaveLength(1);
    expect(wrapper.find("Contact").first().props().room.uri).toEqual(
      rooms.friend.uri
    );
    meetupButton.simulate("click");
    expect(wrapper.find("Contact")).toHaveLength(2);
    meetupButton.simulate("click");
    friendButton.simulate("click");
    expect(wrapper.find("Contact")).toHaveLength(0);
  });

  it("correctly filters out rooms onsearch", () => {
    const props = {
      rooms: [],
      user: user,
      isRoomsInitialized: true,
    };
    const wrapper = shallow(<UnderlyingChatBar {...props} />);
    const chatInput = wrapper.find(".searchInput");
    wrapper.setProps({ rooms: Object.values(rooms) });
    chatInput.simulate("change", { target: { value: "me" } });
    expect(wrapper.state("searchInput")).toEqual("me");
    expect(wrapper.find("Contact")).toHaveLength(1);
    expect(wrapper.find("Contact").first().props().room.uri).toEqual(
      rooms.meetup.uri
    );
    chatInput.simulate("change", { target: { value: user2.first_name } });
    expect(wrapper.state("searchInput")).toEqual(user2.first_name);
    expect(wrapper.find("Contact")).toHaveLength(1);
    expect(wrapper.find("Contact").first().props().room.uri).toEqual(
      rooms.friend.uri
    );
  });

  it("correctly filters out rooms onsearch and onclick", () => {
    const props = {
      rooms: [],
      user: user,
      isRoomsInitialized: true,
      currentRoom: null,
    };
    const wrapper = shallow(<UnderlyingChatBar {...props} />);
    const friendButton = wrapper
      .find("WithStyles(ForwardRef(IconButton))")
      .first();
    const meetupButton = wrapper
      .find("WithStyles(ForwardRef(IconButton))")
      .at(1);
    const chatInput = wrapper.find(".searchInput");
    wrapper.setProps({ rooms: Object.values(rooms) });
    chatInput.simulate("change", { target: { value: "me" } });
    expect(wrapper.find("Contact")).toHaveLength(1);
    meetupButton.simulate("click");
    expect(wrapper.find("Contact")).toHaveLength(0);
    chatInput.simulate("change", { target: { value: user2.first_name } });
    expect(wrapper.state("searchInput")).toEqual(user2.first_name);
    expect(wrapper.state("filters")).toEqual({ friend: false, meetup: true });
    expect(wrapper.find("Contact")).toHaveLength(1);
    friendButton.simulate("click");
    expect(wrapper.find("Contact")).toHaveLength(0);
    chatInput.simulate("change", { target: { value: "" } });
    expect(wrapper.find("Contact")).toHaveLength(0);
  });
});
