import React, { Component } from "react";
import { connect } from "react-redux";
import { getMeetups, getPreferences } from "../../actions";
import { MeetupCard, CategoryAutocomplete, MeetupForm, SearchMap, SkeletonRestaurant, Location } from "../components";
import {
  Grid,
  Grow,
  Avatar,
  CircularProgress,
  FormControlLabel,
  Radio,
  Slider,
  BottomNavigation,
  BottomNavigationAction,
  Fab
} from "@material-ui/core";
import {axiosClient} from '../../accounts/axiosClient'
import {Pagination} from '@material-ui/lab'
import {Settings as SettingsIcon, Event as EventIcon, Add as AddIcon, Map as MapIcon} from '@material-ui/icons'
import moment from "moment";
import PropTypes from "prop-types";
import {
  userPropType,
  preferencePropType,
  meetupPropType,
} from "../../constants/prop-types";
import { Helmet } from "react-helmet";
import "react-dates/lib/css/_datepicker.css";
import "react-dates/initialize";
import "../../styles/datePicker.css"
import Geocode from "react-geocode";
import { DateRangePicker, isInclusivelyAfterDay } from "react-dates";
import styles from '../../styles/search.module.css'

const marks = [
  { value: 5 },
  { value: 10 },
  { value: 15 },
  { value: 20 },
  { value: 25 },
];

const defaultFilters = {
  startDate: moment(),
  endDate: moment().add("7", "d"),
  radius: 10,
  start: 0,
  type: "public"
}

const parseURL = path => {
  let params = new URLSearchParams(path)
  params = Object.fromEntries(params)
  return params
}

const formatCategories = (entries) => {
  var ids = [];
  for (var category in entries) {
    ids.push(entries[category].id);
  }
  let categoriesString = ids.join(",");

  return categoriesString.length > 0 ? categoriesString : null;
};

export const isOutsideRange = (day) => {
  return (
    !isInclusivelyAfterDay(day, moment()) ||
    day.isAfter(moment().add("30", "d"))
  );
};

const countFilters = params => {
  let count = 0;
    for(let key in params){
        if (key === 'location' || key ==='type'){
            continue;
        }
        count += 1
    }

    return count;
}

class Meetups extends Component {
  
  constructor(props) {
    super(props);
    Geocode.setApiKey(`${process.env.REACT_APP_GOOGLE_API_KEY}`);
    const params = parseURL(props.location.search)
    this.state = {
      loading: true,
      latitude: null,
      longitude: null,
      location: "",
      totalCount: null,
      focusedInput: null,
      newMeetupForm: false,
      entries: [],
      preferences: [],
      clickedPreferences: [],
      meetups: [],
      hoveredIndex: null,
      filters: {
        startDate: moment(),
        endDate: moment().add("7", "d"),
        type: params.type ? params.type : "public",
        radius: params.radius ? params.radius : props.user.settings.radius,
        start: params.start ? parseInt(params.start) : 0
      },
      isMobile: window.matchMedia("(max-width: 1100px)").matches,
      mobileTabIndex: 0
    };
  }

  async componentDidMount() {
    const handler = (e) => this.setState({ isMobile: e.matches });
    window.matchMedia("(max-width: 1100px)").addListener(handler);

    let params = parseURL(this.props.location.search)

    if (params.location) {
      const response = await axiosClient.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${params.location}`)
      const result = response.data.results[0]
      this.setState(
          {
              location: result.formatted_address,
              latitude: result.geometry.location.lat,
              longitude: result.geometry.location.lng
          }, 
          () => this.callSearch(params)
      )
    } else {
      this.callSearch(params) 
    }

    this.props.getPreferences(this.props.user.id)
  }

  async componentDidUpdate(prevProps) {
    if (this.props.preferences !== this.state.preferences) {
      this.setState({
        preferences: this.props.preferences,
      });
    }

    if (prevProps.location !== this.props.location){
        const pastParams = parseURL(prevProps.location.search)
        const newParams = parseURL(this.props.location.search)
        if (pastParams.location !== newParams.location){
            const response = await axiosClient.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${newParams.location}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`)
            const result = response.data.results[0]
            this.setState(
                {
                    location: result.formatted_address,
                    latitude: result.geometry.location.lat,
                    longitude: result.geometry.location.lng
                }, 
                () => this.callSearch(newParams)
            )
        } else {
            await this.callSearch(newParams)
        }
    }
  }

  callSearch = async (params) => {
    this.setState({loading: true})

    const response = await axiosClient.request({
      method: "GET",
      url: "/api/meetups/",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      params: {
        ...params, 
        latitude: this.state.latitude,
        longitude: this.state.longitude
      },
    });
  
    this.setState({
      totalCount: response.data.count,
      meetups: Object.values(response.data.meetups),
      latitude: response.data.coords.latitude,
      longitude: response.data.coords.longitude
    })
    
    setTimeout(() => this.setState({loading: false}), 200)
  }

  handleFilterChange = () => {
    const urlParams = parseURL(this.props.location.search)
    const params = {
      ...(urlParams.location && {location: urlParams.location}),
      ...(this.state.filters.radius !== 25 && {radius: this.state.filters.radius}),
      ...(this.state.entries.length > 0 && {categories: formatCategories(this.state.entries)}),
      ...(this.state.filters.start !== 0 && {start: this.state.filters.start}),
      ...(this.state.filters.startDate.format("YYYY-MM-DD") !== moment().format("YYYY-MM-DD") && {startDate: this.state.filters.startDate.format("YYYY-MM-DD")}),
      ...(this.state.filters.endDate.format("YYYY-MM-DD") !== moment().add("7", "d").format("YYYY-MM-DD") && {endDate: this.state.filters.endDate.format("YYYY-MM-DD")}),
      type: this.state.filters.type
    }

    const urlify = new URLSearchParams(params).toString()
    this.props.history.push(`/meetups?${urlify}`)
  }

  handleLocationInput = (e, value, reason) => {
    this.setState({location: value})
  }

  handleLocationClick = (e, value) => {
    if (value !== null) {
      Geocode.fromAddress(value.description).then((response) => {
          const geolocation = response.results[0].geometry.location;
          console.log(geolocation)
          this.setState({
            location: value.description,
            latitude: geolocation.lat,
            longitude: geolocation.lng
          })
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }
  
  handlePagination = (e, page) => {
    this.setState(
      {
        filters: {
          ...this.state.filters, 
          start: 10 * (page - 1)
        }
      }, 
      () => this.handleFilterChange()
    )
  }

  handleHover = (index) => {
    this.setState({hoveredIndex: index})
  }

  handleClearFilters = () => {
    this.props.history.push(`/meetups?type=${this.state.filters.type}`)
  }
  

  /**
   * Get public meetups or private meetups
   * @param {string} type - Public or Private
   */
  handleMeetupsType = (type) => {
    if (type !== this.state.filters.type) {
      this.setState({ filters: {...this.state.filters, type}}, () =>
        this.handleFilterChange()
      );
    }
  };

  /**
   * Filter public/private meetups by preferences.
   * @param {number} index - Index of clicked preference
   */
  handlePreferenceClick = (index) => {
    const category = this.state.preferences[index].category;
    const clickedPreferences = [...this.state.clickedPreferences];
    let entries;
    if (!clickedPreferences[index]) {
      entries = [...this.state.entries, category];
    } else {
      entries = this.state.entries.filter(
        (entry) => JSON.stringify(entry) !== JSON.stringify(category)
      );
    }
    clickedPreferences[index] = !clickedPreferences[index];
    this.setState({ clickedPreferences, entries }, () =>
      this.handleFilterChange()
    );
  };

  /**
   * Filter public/private meetups by date range.
   * @param {Object} - Start date - End date
   */
  onDatesChange = ({ startDate, endDate }) => {
    if (!startDate || !endDate) return;
    if (!startDate.isValid() || !endDate.isValid()) return;
    this.setState({ filters: {...this.state.filters, startDate, endDate }}, () =>
      this.handleFilterChange()
    );
  };

  onFocusChange = (focusedInput) => {
    const overflow = focusedInput ? false : true
    this.setState({ focusedInput, overflow });
  };

  /**
   * Filter public/private meetups by category from autocomplete.
   * @param {Array} values - Array of categories.
   */
  onTagsChange = (event, values) => {
    var clickedPrefs = [...this.state.clickedPreferences];

    for (var i = 0; i < clickedPrefs.length; i++) {
      if (clickedPrefs[i]) {
        let pref = this.state.preferences[i];
        let category = pref.category;

        if (!values.includes(category)) {
          clickedPrefs[i] = !clickedPrefs[i];
        }
      }
    }

    for (var j = 0; j < values.length; j++) {
      let category = values[j];

      for (var z = 0; z < this.state.preferences.length; z++) {
        let preference = this.state.preferences[z];
        if (
          JSON.stringify(preference.category) === JSON.stringify(category) &&
          clickedPrefs[z] !== true
        ) {
          clickedPrefs[z] = true;
        }
      }
    }

    this.setState({ entries: values, clickedPreferences: clickedPrefs }, () =>
      this.handleFilterChange()
    );
  };

  openFormModal = () => {
    this.setState({ newMeetupForm: !this.state.newMeetupForm });
  };

  handleMobileTabChange = (e, newValue) => {
    this.setState({mobileTabIndex: newValue})
  }

  render() {
    const coordinates = {latitude: this.state.latitude, longitude: this.state.longitude}
    const meetups = this.state.meetups;
    const locationName = this.state.location ? this.state.location : "Me"
    const params = parseURL(this.props.location.search)
    const numFilters = countFilters(params)

    const renderPreset = () => {
      return (
        <div className={styles.preset}>
          {this.state.preferences.map((pref, index) => (
            <div
              key={pref.id}
              onClick={() => this.handlePreferenceClick(index)}
              className={`${styles.presetCategory} ${
                this.state.clickedPreferences[index] ? styles.active: ""
              }`}
            >
              <Avatar
                variant="square"
                src={`${process.env.REACT_APP_S3_STATIC_URL}/static/category/${pref.category.api_label}.png`}
              />
              <span>{pref.category.label}</span>
            </div>
          ))}
        </div>
      );
    };

    return (
      <div className={`${styles.searchPage} ${this.state.isMobile ? styles.mobileSearch :""}`}>
        <Helmet>
          <meta charSet="utf-8" />
          <meta name="description" content="Meetups near you!" />
          <title>Meetups</title>
        </Helmet>
        <div className={`${styles.searchConfig} ${this.state.isMobile ? (this.state.mobileTabIndex === 0 ? styles.mobileShow : styles.mobileHide) : ""}`}>
          <div className={styles.header}>
            <div>
              {`${numFilters === 0 ? "No" : numFilters} Filters`}
              {params.hasOwnProperty('startDate') &&
                  <span className={styles.chip}>
                      Start - {this.state.filters.startDate.format("YYYY-MM-DD")}
                  </span>
              }
              {params.hasOwnProperty('endDate') &&
                  <span className={styles.chip}>
                      End - {this.state.filters.endDate.format("YYYY-MM-DD")} 
                  </span>
              }
              {params.hasOwnProperty('radius') &&
                  <span className={styles.chip}>
                      Radius - {this.state.filters.radius} miles
                  </span>
              }
              {this.state.entries.map((category) => 
                  <span className={styles.chip}>
                      <Avatar
                          variant="square"
                          src={`${process.env.REACT_APP_S3_STATIC_URL}/static/category/${category.api_label}.png`}
                      >
                      <img
                          alt={"&#9787;"}
                          src={`${process.env.REACT_APP_S3_STATIC_URL}/static/general/panda.png`}
                      />
                      </Avatar>
                      {category.label}
                  </span>
              )}
              <div className={styles.clearFilters} onClick={this.handleClearFilters}>
                  {numFilters > 0 && 
                      "Clear Filters"
                  }
              </div>
            </div>
            <div>
              
              <Fab
                color="secondary"
                size="medium"
                onClick={this.openFormModal}
                aria-label="add-meetup"
              >
                <AddIcon/>
              </Fab>
              
            </div>
          </div>
          <div className={styles.filter}>
            <div className={styles.filterTitle}>
              Location
            </div>
            <div className={styles.filterSetting}>
              <Location
                  freeSolo={true}
                  required={false}
                  label="Location"
                  handleClick={this.handleLocationClick}
                  handleInputChange={this.handleLocationInput}
                  textValue={this.state.location}
                  background="#fff"
              />
            </div>
          </div>
          <div className={styles.filter}>
            <div className={styles.filterTitle}>
              Type
            </div>
            <div className={styles.filterSetting}>
                <FormControlLabel
                  label="Public"
                  control={
                    <Radio
                      size="small"
                      color="primary"
                      checked={this.state.filters.type==='public'}
                      onClick={() => this.handleMeetupsType("public")} 
                    />
                  }
                />
                <FormControlLabel
                  label="Private"
                  control={
                    <Radio
                      size="small"
                      color="primary"
                      checked={this.state.filters.type==='private'}
                      onClick={() => this.handleMeetupsType("private")} 
                    />
                  }
                />
            </div>
          </div> 
          <div className={styles.filter}>
            <div className={styles.filterTitle}>
              Dates
            </div>
            <div className={styles.filterSetting}>
              <DateRangePicker
                onDatesChange={this.onDatesChange}
                onFocusChange={this.onFocusChange}
                focusedInput={this.state.focusedInput}
                startDate={this.state.filters.startDate}
                startDateId="unique_start_date_id"
                endDate={this.state.filters.endDate}
                endDateId="unique_end_date_id"
                keepOpenOnDateSelect
                hideKeyboardShortcutsPanel
                minimumNights={0}
                daySize={45}
                numberOfMonths={this.state.isMobile ? 1 : 2}
                isOutsideRange={
                  this.state.public ? isOutsideRange : () => false
                }
                noBorder  
                displayFormat="MMMM DD"
                small
              />
            </div>
          </div>   
          <div className={styles.filter}>
            <div className={styles.filterTitle}>
              Radius
              <span className={styles.chip} style={{marginLeft: 10}}>
                {`${this.state.filters.radius} miles`}
              </span>
            </div>
            <div className={styles.filterSetting}>
                <Slider
                  valueLabelDisplay="off"
                  step={5}
                  marks={marks}
                  value={this.state.filters.radius}
                  min={5}
                  max={25}
                  onChange={(e, val) => this.setState({filters: {...this.state.filters, radius: val}})}
                  onChangeCommitted={(e, val) => this.handleFilterChange()}
                />
              
            </div>
          </div>
          <div className={styles.filter}>
            <div className={styles.filterTitle}>
                Categories
            </div>
            <div className={styles.filterSetting}>
              <CategoryAutocomplete
                fullWidth={true}
                size="small"
                entries={this.state.entries}
                handleClick={this.onTagsChange}
                label="Search Categories..."
                background="#fff"
              />
            </div>
          </div>
          <div className={styles.filter}>
            <div className={styles.filterTitle}>
                Preferences
            </div>
            <div className={styles.filterSetting}>
                {renderPreset()}
            </div>
          </div> 
        </div>
        <div className={`${styles.resultsWrapper} ${this.state.isMobile ? (this.state.mobileTabIndex === 1 ? styles.mobileShow : styles.mobileHide) : ""}`}>
          <div className={styles.resultsTop}>
            <div className={styles.resultsName}>
                Meetups Near {locationName}
            </div>
          </div>
          <div className={styles.results}>
            {this.state.loading ?
                [...Array(10).keys()].map((num) => 
                    <SkeletonRestaurant/>
                )
                :
                meetups.map((meetup, index) => (
                  <Grow in={true} timeout={Math.max((index + 1) * 50, 500)}>
                    <div className={styles.resultWrapper}>
                      <MeetupCard 
                        key={meetup.id} 
                        onHover={this.handleHover}
                        meetup={meetup} 
                        index={index + this.state.filters.start}
                      />
                    </div>
                  </Grow>
                ))
            }
          </div>
          <div className={styles.resultsPagination}>
              <Pagination 
                  page={this.state.filters.start/10 + 1}
                  onChange={this.handlePagination}
                  count={Math.ceil(this.state.totalCount/10)}
                  shape="rounded"
              />
              <div className={styles.resultsCount}>
                  {this.state.filters.start + 1} - {Math.min(this.state.filters.start + 11, this.state.totalCount)} of {this.state.totalCount} entries
              </div>
          </div>
        </div>
        <div className={`${styles.searchMap} ${this.state.isMobile ? (this.state.mobileTabIndex === 2 ? styles.mobileShow : styles.mobileHide) : ""}`}>
          {coordinates.latitude !== null && 
            <SearchMap 
                indexOffset={this.state.filters.start}
                markers={this.state.meetups}
                zoom={11}
                type="meetups"
                location={coordinates}
                radius={this.state.filters.radius}
                hoveredIndex={this.state.hoveredIndex}
            />
          }
        </div>
        <MeetupForm
          type="create"
          handleClose={this.openFormModal}
          open={this.state.newMeetupForm}
          isMobile={this.state.isMobile}
        />
        {this.state.isMobile && 
          <div className="innerWrap-mobileControl">
            <BottomNavigation value={this.state.mobileTabIndex} onChange={this.handleMobileTabChange} showLabels>
              <BottomNavigationAction label="Settings" icon={<SettingsIcon/>}/>
              {/* <Fab
                className="mobileControl-Fab"
                color="primary"
                size="medium"
                onClick={this.openFormModal}
              >
                  <AddIcon/>
              </Fab> */}
              <BottomNavigationAction label="Meetups" icon={<EventIcon/>}/>
              <BottomNavigationAction label="Map" icon={<MapIcon/>}/>
            </BottomNavigation>
          </div>
        }
      </div>
    );
  }
}

Meetups.propTypes = {
  isMeetupsInitialized: PropTypes.bool.isRequired,
  meetups: PropTypes.arrayOf(meetupPropType).isRequired,
  user: userPropType,
  preferences: PropTypes.arrayOf(preferencePropType).isRequired,
  getMeetups: PropTypes.func.isRequired,
  getPreferences: PropTypes.func.isRequired,
  isMeetupsFetching: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.user.user,
    preferences: state.user.preferences,
  };
}

const mapDispatchToProps = {
  getMeetups,
  getPreferences,
};

export default connect(mapStateToProps, mapDispatchToProps)(Meetups);
export { Meetups as UnderlyingMeetups };
