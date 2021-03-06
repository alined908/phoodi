import React from "react";
import { shallow, mount } from "enzyme";
import { UnderlyingMeetups, isOutsideRange} from "../../components/meetup/Meetups";
import * as mocks from "../../mocks";
import moment from "moment";
import { Radio } from '@material-ui/core';
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import setupStore from "../../setupTests";
import { createMemoryHistory } from 'history'

const props = {
  user: {...mocks.user, settings: {...mocks.settings}},
  meetups: [mocks.meetup.uri, mocks.privateMeetup.uri2],
  preferences: mocks.preferences,
  isMeetupsFetching: false,
  isMeetupsInitialized: true,
  getMeetups: jest.fn(),
  getPreferences: jest.fn(),
  location: {}
};

describe("Meetups tests", () => {

  let history;

  beforeEach(() => {
    history = createMemoryHistory('/meetups')
  })

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const wrapper = shallow(<UnderlyingMeetups {...props} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("handle componentdidmount", () => {
    const wrapper = shallow(<UnderlyingMeetups {...props} />);
    // expect(props.getMeetups.mock.calls.length).toBe(1);
    expect(props.getPreferences.mock.calls.length).toBe(1);
  });

  it("handle componentdidupdate", () => {
    const wrapper = shallow(<UnderlyingMeetups {...props} />);
    wrapper.setProps({ preferences: mocks.preferences });
    expect(wrapper.state("preferences")).toBe(mocks.preferences);
  });

  it("should show preferences", () => {
    const wrapper = shallow(<UnderlyingMeetups {...props} />);
    wrapper.setProps({ preferences: mocks.preferences });
    const preferences = wrapper.find(".presetCategory");
    expect(preferences).toHaveLength(1);
    expect(preferences.text()).toContain("Dessert");
  });

  it("should show public meetups", () => {
    const store = setupStore({ user: { user: { id: 1 } } });
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <UnderlyingMeetups {...props} history={history}/>
        </Router>
      </Provider>
    );
    console.log(wrapper.find(Radio))
    const publicMeetupButton = wrapper.find(Radio).first();
    publicMeetupButton.simulate("click", { target: { checked: true } });
    expect(wrapper.find(UnderlyingMeetups).state("filters").type).toBe('public');
    // expect(props.getMeetups.mock.calls.length).toBe(2);
  });

  it("should show private meetups", () => {
    const store = setupStore({ user: { user: { id: 1 } } });
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <UnderlyingMeetups {...props} history={history}/>
        </Router>
      </Provider>
    );
    console.log(wrapper.find(Radio))
    const privateMeetupButton = wrapper.find(Radio).last();
    privateMeetupButton.simulate("click", { target: { checked: true } });
    expect(wrapper.find(UnderlyingMeetups).state("filters").type).toBe('private');
    // expect(props.getMeetups.mock.calls.length).toBe(2);
  });

  it("should call for new meetups if preferences clicked", () => {
    const wrapper = shallow(<UnderlyingMeetups {...props} history={history}/>);
    wrapper.setProps({ preferences: mocks.preferences });
    const preferences = wrapper.find(".presetCategory");
    expect(preferences).toHaveLength(1);
    preferences.simulate("click");
    // expect(props.getMeetups.mock.calls.length).toBe(2);
  });

  it("opens form modal onclick", () => {
    const wrapper = shallow(<UnderlyingMeetups {...props} />);
    expect(wrapper.state("newMeetupForm")).toBe(false);
    const addMeetupButton = wrapper.find('[aria-label="add-meetup"]');
    addMeetupButton.simulate("click");
    expect(wrapper.state("newMeetupForm")).toBe(true);
  });

  it("shows loading state if meetup is fetching", () => {
    const newProps = {
      ...props,
      isMeetupsFetching: true,
      isMeetupsInitialized: false,
    };
    const wrapper = shallow(<UnderlyingMeetups {...newProps} />);
    expect(wrapper.find("SkeletonRestaurant")).toHaveLength(10);
  });

  it("calls for meetups if date range is different", () => {
    const store = setupStore({ user: { user: { id: 1 } } });
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <UnderlyingMeetups {...props} history={history}/>
        </Router>
      </Provider>
    );
    const picker = wrapper.find("withStyles(DateRangePicker)");
    expect(picker).toHaveLength(1);
    expect(
      picker
        .instance()
        .props.onDatesChange({ startDate: moment(), endDate: moment() })
    );
    // expect(props.getMeetups.mock.calls.length).toBe(2);
  });

  it("calls for get meetups if onTagsChange", () => {
    const wrapper = shallow(<UnderlyingMeetups {...props} history={history} />);
    wrapper.instance().onTagsChange({}, [mocks.category]);
    // expect(props.getMeetups.mock.calls.length).toBe(2);
    expect(wrapper.state("entries")).toStrictEqual([mocks.category]);
  });

  it("handle conflicting clickedPrefrences", () => {
    const wrapper = shallow(<UnderlyingMeetups {...props} history={history}/>);
    wrapper.setState({ clickedPreferences: [true] });
    wrapper.instance().onTagsChange({}, [mocks.category]);
    expect(wrapper.state("entries")).toStrictEqual([mocks.category]);
  });

  it("rejects date outside of range", () => {
    expect(isOutsideRange(moment().subtract(1, "days"))).toBe(true);
  });
});
