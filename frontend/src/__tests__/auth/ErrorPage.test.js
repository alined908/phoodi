import React from "react";
import { shallow } from "enzyme";
import { ErrorPage } from "../../components/components";

describe("ErrorPage render", () => {
  it("renders without crashing", () => {
    const wrapper = shallow(<ErrorPage />);
    expect(wrapper).toMatchSnapshot();
  });
});
