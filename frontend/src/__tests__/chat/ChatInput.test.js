import React from "react";
import { shallow, mount } from "enzyme";
import { ChatInput } from "../../components/components";
import * as mocks from "../../mocks";
import { Picker } from "emoji-mart";
import ReactDOM from "react-dom";

const props = {
  user: mocks.user,
  room: mocks.rooms.friend,
  socket: { newChatMessage: jest.fn() },
};

const setUp = () => {
  const wrapper = shallow(<ChatInput {...props} />);
  return wrapper;
};

const setUpMessage = (wrapper) => {
  const chatInput = wrapper.find(".input");
  chatInput.simulate("change", { target: { value: "message" } });
  expect(wrapper.state("textValue")).toEqual("message");
};

describe("ChatInput", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render given props", () => {
    const wrapper = setUp();
    expect(wrapper).toMatchSnapshot();
  });

  it("should dispatch sendMessage on click", () => {
    const wrapper = setUp();
    setUpMessage(wrapper);
    const sendButton = wrapper.find(".sendButton");
    sendButton.simulate("click");
    expect(wrapper.state("textValue")).toEqual("");
    expect(props.socket.newChatMessage.mock.calls.length).toBe(1);
  });

  it("should dispatch sendMessage on enter", () => {
    const wrapper = setUp();
    setUpMessage(wrapper);
    const preventDefault = jest.fn();
    wrapper
      .find("input")
      .simulate("keypress", { key: "Enter", preventDefault });
    expect(wrapper.state("textValue")).toEqual("");
    expect(props.socket.newChatMessage.mock.calls.length).toBe(1);
  });

  it("should render emojis", () => {
    const wrapper = setUp();
    expect(wrapper.state("showEmojis")).toEqual(false);
    const emoji = wrapper.find(".emojiIcon");
    emoji.simulate("click");
    expect(wrapper.state("showEmojis")).toEqual(true);
    expect(wrapper.find(Picker)).toHaveLength(1);
  });

  it("should hide emojis on outside detect", () => {
    const map = {};
    document.addEventListener = jest.fn((event, cb) => {
      map[event] = cb;
    });
    const wrapper = mount(<ChatInput {...props} />);
    const emoji = wrapper.find(".emojiIcon");
    emoji.simulate("click");
    expect(wrapper.state("showEmojis")).toEqual(true);
    map.mousedown({
      target: ReactDOM.findDOMNode(wrapper.instance()),
    });
    expect(wrapper.state("showEmojis")).toEqual(false);
  });
});
