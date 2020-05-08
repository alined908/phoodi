import React from "react";
import { shallow, mount } from "enzyme";
import { MeetupCard } from "../../components/components";
import * as mocks from "../../mocks";

const props = {
  meetup: mocks.meetup.uri,
};

describe("MeetupCard", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing given props", () => {
    const wrapper = shallow(<MeetupCard {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("shows events section with categories if meetup has categories", () => {
    const wrapper = shallow(<MeetupCard {...props} />);
    expect(wrapper.find(".cardEvents")).toHaveLength(1);
    expect(wrapper.find(".cardEventsCategory").text()).toContain("Dessert");
  });

  it("doesnt show events section if meetup has no categories", () => {
    const propsNoCategories = { meetup: mocks.meetupWithoutCategories.uri };
    const wrapper = shallow(<MeetupCard {...propsNoCategories} />);
    expect(wrapper.find(".cardEventsCategory")).toHaveLength(0);
  });

  it("shows how many members in meetup", () => {
    const wrapper = shallow(<MeetupCard {...props} />);
    const members = wrapper.find(".cardMembers");
    expect(members.text()).toBe("2 members");
  });
});
