import React, { Component } from "react";
import { Button } from "@material-ui/core";
import { connect } from "react-redux";
import { deleteMeetupEvent, addGlobalMessage } from "../../actions";
import moment from "moment";
import {
  Cached as CachedIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  Error as ErrorIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  Restore as RestoreIcon
} from "@material-ui/icons";
import {
  IconButton,
  Typography,
  Grid,
  Tooltip,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon
} from "@material-ui/core";
import { compose } from "redux";
import {
  MeetupEventOption,
  StaticMap,
  RestaurauntAutocomplete,
  MeetupEventForm,
} from "../components";
import { ReactComponent as Crown } from "../../assets/svgs/crown.svg";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { meetupEventPropType } from "../../constants/prop-types";
import styles from "../../styles/meetup.module.css";

const numToPrices = {
  1: '$',
  2: '$$',
  3: '$$$',
  4: '$$$$'
}

class MeetupEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchOpen: false,
      searchInput: "",
      editMeetupEventForm: false,
      anchor: null,
    };
  }

  handleDelete = () => {
    if (window.confirm("Are you sure you want to delete")) {
      this.props.socket.deleteMeetupEvent({
        uri: this.props.uri,
        event: this.props.event.id,
      });
    }
  };

  handleReload = () => {
    this.props.socket.reloadMeetupEvent({
      meetup: this.props.uri,
      event: this.props.event.id,
    });
  };

  handleDecide = () => {
    this.props.socket.decideMeetupEvent({
      meetup: this.props.uri,
      event: this.props.event.id,
      random: false,
    });
  };

  handleRandom = () => {
    this.props.socket.decideMeetupEvent({
      meetup: this.props.uri,
      event: this.props.event.id,
      random: true,
    });
  };

  handleRedecide = () => {
    this.props.socket.redecideMeetupEvent({
      meetup: this.props.uri,
      event: this.props.event.id,
    });
  };

  handleSearchOption = () => {
    this.setState({ searchOpen: !this.state.searchOpen });
  };

  handleSearchValueClick = (e, value) => {
    if (value !== null) {
      if (this.isRestaurantOptionAlready(value)) {
        this.props.addGlobalMessage("error", "Already an option.");
      } else {
        this.props.socket.addEventOption({
          meetup: this.props.uri,
          event: this.props.event.id,
          option: value,
        });
        this.props.addGlobalMessage("success", "Successfully added option");
      }
    }
    this.setState({ searchInput: "" });
  };

  handleMenuClick = (e) => {
    this.setState({anchor: e.currentTarget})
  }

  handleMenuClose  = () => {
    this.setState({anchor: null})
  }

  openEventModal = () => {
    this.setState({ editMeetupEventForm: !this.state.editMeetupEventForm });
  };

  isRestaurantOptionAlready = (restaurant) => {
    const identifier = restaurant.id;
    const options_keys = this.props.event.options;

    for (let key in options_keys) {
      let rst = options_keys[key].restaurant;
      if (rst.identifier === identifier) {
        return true;
      }
    }

    return false;
  };

  isUserEventCreator = () => {
    return this.props.event.creator.id === this.props.user.id;
  };

  render() {
    const event = this.props.event;
    const isUserEventCreator = this.isUserEventCreator();
    const permission = isUserEventCreator || this.props.isUserCreator;

    const renderHeader = () => {
      return (
        <div className={`${styles.header} elevate`}>
          <Typography variant="h5">
            {event.title}
          </Typography>
         
            <div className={styles.headerIcons}>
              <ScheduleIcon />
              {moment(event.start).local().format("h:mm A")} -{" "}
              {moment(event.end).local().format("h:mm A")}
            </div>
            <Tooltip title="Event Creator">
                <div className={styles.headerIcons}>
                    <Crown width={18} height={18} />
                    {event.creator.first_name} {event.creator.last_name}
              {/* <Avatar style={{transform: "scale(0.5)"}} src={event.creator.avatar}>
                    {event.creator.first_name.charAt(0)} {event.creator.last_name.charAt(0)}
                </Avatar>  */}
                </div>
            </Tooltip>
          <div>
              {(this.props.isUserMember && !this.props.isPast) && renderActions()}
            </div>
        </div>
      );
    };

    const renderActions = () => {
      return (
        <div className={styles.eventActions}>
            <IconButton aria-label="menu" style={{color: "rgba(10,10,10, .95)"}} edge="end" onClick={this.handleMenuClick}>
                <MoreVertIcon/>
            </IconButton>
            <Menu 
                anchorEl={this.state.anchor} 
                open={this.state.anchor} 
                onClose={this.handleMenuClose}
            >
                {!this.props.chosen && (
                    <MenuItem aria-label="add-option" onClick={(e) => {this.handleSearchOption(); this.handleMenuClose(e);}}>
                        <ListItemIcon>
                            <SearchIcon style={{ color: "#4caf50" }} fontSize="small" />
                        </ListItemIcon>
                        <Typography variant="body2" noWrap>
                            Add Option
                        </Typography>
                    </MenuItem>
                )}
                {!this.props.chosen && event.random && (
                    <MenuItem aria-label="reload" onClick={(e) => {this.handleReload(); this.handleMenuClose(e);}}>
                        <ListItemIcon>
                            <CachedIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <Typography variant="body2" noWrap>
                            Reload Options
                        </Typography>
                    </MenuItem>
                )}
                <MenuItem aria-label="edit" onClick={(e) => {this.openEventModal(); this.handleMenuClose(e);}}>
                    <ListItemIcon>
                        <EditIcon color="inherit" fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2" noWrap>
                        Edit Meetup Event
                    </Typography>
                </MenuItem>
                
                {permission && 
                  <MenuItem aria-label="delete" onClick={(e) => {this.handleDelete(); this.handleMenuClose(e);}}>
                      <ListItemIcon>
                          <DeleteIcon color="secondary" fontSize="small" />
                      </ListItemIcon>
                      <Typography variant="body2" noWrap>
                          Delete Event
                      </Typography>
                  </MenuItem>
                }
                {this.props.isMobile && 
                  <>
                    {!this.props.chosen && Object.keys(event.options).length > 0 &&
                      <>
                        <MenuItem aria-label="decide" onClick={(e) => {this.handleDecide(); this.handleMenuClose(e)}}>
                          <ListItemIcon>
                            <CheckIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <Typography variant="body2" noWrap>
                            Decide Options
                          </Typography>
                        </MenuItem>
                        <MenuItem aria-label="random" onClick={(e) => {this.handleRandom(); this.handleMenuClose(e)}}>
                          <ListItemIcon>
                            <CheckIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <Typography variant="body2" noWrap>
                            Random Options
                          </Typography>
                        </MenuItem>
                      </>
                    }
                    {this.props.chosen && 
                      <MenuItem aria-label="redecide" onClick={(e) => {this.handleRedecide(); this.handleMenuClose(e)}}>
                        <ListItemIcon>
                          <RestoreIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <Typography variant="body2" noWrap>
                          Redecide Event
                        </Typography>
                      </MenuItem>
                    } 
                  </>
                }
            </Menu>
        </div>
      );
    };

    const renderFinalizeActions = () => {
      return (
        <div className={styles.eventDecideActions}>
          {!this.props.chosen && Object.keys(event.options).length > 0 && (
            <Button
              className="button"
              size="small"
              variant="contained"
              color="primary"
              aria-label="decide"
              onClick={() => this.handleDecide()}
            >
              Decide
            </Button>
          )}
          {!this.props.chosen && Object.keys(event.options).length > 0 && (
            <Button
              className="button"
              size="small"
              variant="contained"
              color="primary"
              aria-label="random"
              onClick={() => this.handleRandom()}
            >
              Random
            </Button>
          )}
          {this.props.chosen && (
            <Button
              className="button"
              size="small"
              variant="contained"
              color="primary"
              aria-label="redecide"
              onClick={() => this.handleRedecide()}
            >
              Redecide
            </Button>
          )}
        </div>
      );
    };

    const renderFourSquare = (options) => {
      const keys = Object.keys(options).reverse();

      return (
        <div className={styles.foursquare}>
          {keys.length > 0 ? (
            <Grid justify="space-evenly" container spacing={2}>
              {keys.map((key, index) => (
                <MeetupEventOption
                  socket={this.props.socket}
                  full={true}
                  isPast={this.props.isPast}
                  isUserMember={this.props.isUserMember}
                  event={this.props.event.id}
                  meetup={this.props.uri}
                  optionId={key}
                />
              ))}
            </Grid>
          ) : (
            <div className={`${styles.explanation} elevate`}>
              <span style={{ marginRight: "1rem" }}>
                <ErrorIcon style={{ color: "rgb(255, 212, 96)" }} />
              </span>
              {event.random ? (
                <span>
                  No options available. This may be due to no options being
                  available at this time or the categories specified don't have
                  enough options. Press the edit button to add more categories
                  or change time if inputted incorrectly.
                </span>
              ) : (
                <span>
                  No options chosen. Click the top right magnifying glass to
                  search for restauraunts near you!
                </span>
              )}
            </div>
          )}
        </div>
      );
    };

    const renderChosen = (chosen) => {
      const option = chosen.restaurant;
      const position = {
        latitude: option.latitude,
        longitude: option.longitude,
      };

      return (
        <div className={styles.chosen}>
          <div className={styles.chosenRestaurant}>
            <MeetupEventOption
              key={chosen.id}
              socket={this.props.socket}
              isUserMember={this.props.isUserMember}
              full={false}
              isPast={this.props.isPast}
              event={this.props.event.id}
              meetup={this.props.uri}
              optionId={chosen.id}
            />
          </div>
          <div className={`${styles.chosenMap} elevate`}>
            <div className={styles.mapWrapper}>
              <StaticMap location={position} />
            </div>
          </div>
        </div>
      );
    };

    return (
      <div id={`event-${event.id}`} className={styles.event}>
        {renderHeader()}
        <div
          className={`${styles.secondHeader} elevate`}
        >
          <div className={styles.secondHeaderLeft}>
            Categories  
            {event.categories.length === 0  ?
                <span className={styles.categoryChip}>
                    All
                </span>
                :
                event.categories.map((category) => (
                  <span
                    className={`${styles.categoryChip} ${styles.categoryChipHover}`}
                  >
                    <Avatar
                      style={{ width: 20, height: 20 }}
                      src={`${process.env.REACT_APP_S3_STATIC_URL}/static/category/${category.api_label}.png`}
                      variant="square"
                    />
                    {category.label}
                  </span>
                ))
            }
            
          </div>
          <div className={styles.secondHeaderLeft}>
            Price
            {console.log(event.price)}
            {event.price.map((price, index) => (
              <span key={index} className={styles.categoryChip}>
                {numToPrices[price]}
              </span>
            ))}
          </div>
          <div className={styles.secondHeaderLeft}>
            Distance
            <span className={styles.categoryChip}>
              {Math.round(event.distance * 0.000621371192).toFixed(2)}
            </span>
          </div>
          {(this.props.isUserMember && !this.props.isPast && !this.props.isMobile) && renderFinalizeActions()}
        </div>
        {!this.props.chosen && (
          <>
            {this.state.searchOpen && (
              <div className={`${styles.addOptionSearch} elevate`}>
                <img
                  style={{ width: 20, height: 20, marginLeft: 10 }}
                  alt={"&#9787;"}
                  src={`${process.env.REACT_APP_S3_STATIC_URL}/static/general/panda.png`}
                />
                <RestaurauntAutocomplete
                  coords={this.props.coords}
                  radius={event.distance}
                  label="Type a restauraunt name or category..."
                  textValue={this.state.searchInput}
                  handleSearchValueClick={this.handleSearchValueClick}
                />
                <Divider className="divider" orientation="vertical" />
                <Tooltip title="Close">
                  <IconButton
                    color="secondary"
                    onClick={this.handleSearchOption}
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </div>
            )}
          </>
        )}
        {!this.props.chosen && renderFourSquare(event.options)}
        {this.props.chosen && renderChosen(event.options[this.props.chosen])}
        {this.state.editMeetupEventForm && (
            <MeetupEventForm
              type="edit"
              event={event.id}
              uri={this.props.uri}
              handleClose={this.openEventModal}
              open={this.state.editMeetupEventForm}
            />
        )}
      </div>
    );
  }
}

MeetupEvent.propTypes = {
  number: PropTypes.number.isRequired,
  socket: PropTypes.object.isRequired,
  uri: PropTypes.string.isRequired,
  isUserMember: PropTypes.bool.isRequired,
  coords: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }),
  event: meetupEventPropType,
  chosen: PropTypes.number,
  settings: PropTypes.object.isRequired,
  deleteMeetupEvent: PropTypes.func.isRequired,
  addGlobalMessage: PropTypes.func.isRequired,
};

function mapStateToProps(state, props) {
  return {
    chosen: state.meetup.meetups[props.uri].events[props.event.id].chosen,
    settings: state.user.user.settings,
  };
}

const mapDispatchToProps = {
  deleteMeetupEvent,
  addGlobalMessage,
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
  MeetupEvent
);

export { MeetupEvent as UnderlyingMeetupEvent };
