import React, { Component } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  BottomNavigation, 
  BottomNavigationAction
} from "@material-ui/core";
import {Edit as EditIcon, Settings as SettingsIcon} from '@material-ui/icons'
import { Location, PasswordChange, EmailChange } from "../components";
import Geocode from "react-geocode";
import { connect } from "react-redux";
import { addSettings } from "../../actions";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import styles from "../../styles/user.module.css";

const labels = {
  1: "1 Mile",
  5: "5 Miles",
  10: "10 Miles",
  15: "15 Miles",
  20: "20 Miles",
  25: "25 Miles",
};

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      radius: props.settings.radius,
      location: props.settings.location,
      longitude: props.settings.longitude,
      latitude: props.settings.latitude,
      activeForm: 0,
      isMobile: window.matchMedia("(max-width: 768px)").matches,
      mobileTabIndex: 0
    };
    this.handleClick = this.handleClick.bind(this);
    Geocode.setApiKey(`${process.env.REACT_APP_GOOGLE_API_KEY}`);
  }

  componentDidMount() {
    const handler = (e) => this.setState({ isMobile: e.matches });
    window.matchMedia("(max-width: 768px)").addListener(handler);
  }

  handleRadius = (e) => {
    this.setState({ radius: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    let data = {
      location: this.state.location,
      radius: this.state.radius,
      longitude: this.state.longitude,
      latitude: this.state.latitude,
    };
    this.props.addSettings(data);
  };

  handleClick = (e, value) => {
    console.log(value);
    let location;
    if (value === null) {
      location = "";
    } else {
      location = value.description;
      Geocode.fromAddress(location).then(
        (response) => {
          const geolocation = response.results[0].geometry.location;
          console.log(geolocation);
          this.setState({
            longitude: geolocation.lng,
            latitude: geolocation.lat,
          });
        },
        (error) => {
          console.error(error);
        }
      );
    }
    this.setState({ location });
  };

  handleFormChange = (index) => {
    if (index !== this.state.activeForm){
      this.setState({activeForm: index, mobileTabIndex: 1})
    }
  }

  handleMobileTabChange = (e, newValue) => {
    this.setState({mobileTabIndex: newValue})
  }

  render() {
    return (
        <div className={`innerWrap  ${this.state.isMobile ? "innerWrap-mobile": ""}`}>
          <Helmet>
            <meta charSet="utf-8" />
            <title>Settings</title>
            <meta name="description" content="Settings" />
          </Helmet>
            <div className={`innerLeft ${this.state.isMobile ? "innerLeft-mobile": ""} ${this.state.mobileTabIndex === 0 ? "innerLeft-show" : ""}`}>
              <div className="innerLeftHeader">
                Settings
              </div>
              <div className="innerLeftHeaderBlock">
                <div className="hr">General</div>
                <div className="innerLeftHeaderBlockAction">
                  <div className="blockActionHeader">
                    Max Radius 
                    <span className="blockActionChip">
                      {this.props.settings.radius} miles
                    </span>
                  </div>
                </div>
                <div className="innerLeftHeaderBlockAction">
                  <div className="blockActionHeader">
                    Location 
                    <span className="blockActionChip">
                      {this.props.settings.location}
                    </span>
                  </div>
                </div>
              </div>
              <div className="innerLeftHeaderBlock">
                <div className="hr">Account</div>
                <div 
                  className={`innerLeftHeaderBlockAction ${styles.clickable} ${this.state.activeForm === 0 ? styles.active : ""}`}
                  onClick={() => this.handleFormChange(0)}
                >
                  <div className="blockActionHeader" >
                    Change General
                  </div>
                </div>
                <div 
                  className={`innerLeftHeaderBlockAction ${styles.clickable} ${this.state.activeForm === 1 ? styles.active : ""}`} 
                  onClick={() => this.handleFormChange(1)}
                >
                  <div className="blockActionHeader">
                    Change Password
                  </div>
                </div>
                <div 
                  className={`innerLeftHeaderBlockAction ${styles.clickable} ${this.state.activeForm === 2 ? styles.active : ""}`} 
                  onClick={() => this.handleFormChange(2)}
                >
                  <div className="blockActionHeader">
                    Change Email
                  </div>
                </div>
              </div>
          </div>
          <div className={`innerRight ${this.state.isMobile ? "innerRight-mobile": ""} ${this.state.mobileTabIndex === 0 ? "" : "innerRight-show"}`}>
            <div className="innerRightBlock" style={{height: "100%"}}>
              <div className="innerRightBlockHeader" style={{"height": "100%"}}>
                <div className="hr">Settings</div>
                <div className={styles.form}>
                  {this.state.activeForm === 0 &&
                    <form className={styles.formInner}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormControl className={styles.settingsFormControl}>
                            <InputLabel>Max Radius</InputLabel>
                            <Select
                              className={styles.select}
                              value={this.state.radius}
                              onChange={this.handleRadius}
                            >
                              {Object.keys(labels).map((num) => (
                                <MenuItem value={num}>{labels[num]}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <div className={styles.settingsLocation}>
                            <Location
                              label="Location"
                              handleClick={this.handleClick}
                              textValue={this.state.location}
                            />
                          </div>        
                        </Grid>
                      </Grid>
                      <div className={styles.settingsSave}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={this.handleSubmit}
                        >
                          Save
                        </Button>
                      </div>
                    </form>
                  }
                  {this.state.activeForm === 1 && 
                    <PasswordChange />
                  }
                  {this.state.activeForm === 2 && 
                    <EmailChange/>
                  }
                </div>
              </div>
            </div>
          </div>
          {this.state.isMobile && 
            <div className="innerWrap-mobileControl">
              <BottomNavigation value={this.state.mobileTabIndex} onChange={this.handleMobileTabChange} showLabels>
                  <BottomNavigationAction label="Settings" icon={<SettingsIcon/>}/>
                  <BottomNavigationAction label="Edit" icon={<EditIcon/>}/>
              </BottomNavigation>
            </div>
          }
        </div>
        
    );
  }
}

Settings.propTypes = {
  settings: PropTypes.shape({
    radius: PropTypes.number,
    location: PropTypes.string,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
  addSettings: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    settings: state.user.user.settings,
  };
}

const mapDispatchToProps = {
  addSettings,
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
