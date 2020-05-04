import React from "react";
import { shallow } from "enzyme";
import { UnderlyingMeetupEventOption } from "../../components/meetup/MeetupEventOption";
import * as mocks from "../../mocks";

const props = {
  socket: {},
  isUserMember: true,
  event: 1,
  meetup: "uri",
  full: true,
  option: mocks.option[1],
  data: mocks.option[1].id,
  members: mocks.meetup.members,
  user: mocks.user,
};

describe("MeetupWrapper tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render without crashing", () => {
    const wrapper = shallow(<UnderlyingMeetupEventOption {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
