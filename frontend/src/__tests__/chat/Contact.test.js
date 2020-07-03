import React from "react";
import { shallow } from "enzyme";
import { Contact } from "../../components/components";
import { user, rooms } from "../../mocks/index";

describe("Contact unit", () => {
  it("renders without crashing given props", () => {
    const props = {
      user: user,
      room: rooms.friend,
    };
    const wrapper = shallow(<Contact {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("determines if contact is friend", () => {
    const props = {
      user: user,
      room: rooms.friend,
    };

    const wrapper = shallow(<Contact {...props} />);
    expect(wrapper.find(".contactInfo")).toHaveLength(1);
    expect(wrapper.find(".avatars")).toHaveLength(0);
  });

  it("determines if contact is meetup", () => {
    const props = {
      user: user,
      room: rooms.meetup,
    };

    const wrapper = shallow(<Contact {...props} />);
    expect(wrapper.find(".contactInfo")).toHaveLength(0);
    expect(wrapper.find(".avatars")).toHaveLength(1);
  });

  it("determines if contact is current room", () => {
    const props = {
      user: user,
      room: rooms.friend,
      currentRoom: "abc",
    };
    const wrapper = shallow(<Contact {...props} />);
    expect(wrapper.find(".currentRoom")).toHaveLength(1);
  });

  it("determines if contact is not current room", () => {
    const props = {
      user: user,
      room: rooms.friend,
      currentRoom: "xyz",
    };
    const wrapper = shallow(<Contact {...props} />);
    expect(wrapper.find(".currentRoom")).toHaveLength(0);
  });

  // it("renders and removes notifications", () => {
  //   const props = {
  //     user: user,
  //     room: rooms.meetup,
  //     currentRoom: "abc",
  //     removeNotifs: jest.fn(),
  //     onShow: jest.fn()
  //   };
  //   const wrapper = shallow(<UnderlyingContact {...props} />);
  //   expect(wrapper.state("notifs")).toEqual(3);
  //   wrapper.find("Link").simulate("click");
  //   expect(wrapper.state("notifs")).toEqual(0);
  //   expect(props.removeNotifs.mock.calls.length).toBe(1);
  // });
});
