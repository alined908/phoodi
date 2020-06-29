import React, { Component } from "react";
import {
  MeetupEvent,
  MeetupForm,
  MeetupChat,
  MeetupEventForm,
  MeetupTree,
  MeetupFriends,
  MeetupMembers
} from "../components";
import { connect } from "react-redux";
import {
  deleteMeetup,
  getMeetupEvents,
  addMeetupEvent,
  sendMeetupEmails,
  deleteMeetupEvent,
  deleteEventOption,
  addMeetupMember,
  deleteMeetupMember,
  addEventOption,
  reloadMeetupEvent,
  voteMeetupEvent,
  decideMeetupEvent,
  getFriends,
  addGlobalMessage,
  sendFriendInvite,
  handleLeaveMeetup,
  handlePublicMeetupJoin,
} from "../../actions";
import { Link } from "react-router-dom";
import moment from "moment";
import {
  Button,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  BottomNavigation, 
  BottomNavigationAction
} from "@material-ui/core";
import WebSocketService from "../../accounts/WebSocket";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Chat as ChatIcon,
  Email as EmailIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
  Block as BlockIcon,
  ExitToApp as ExitToAppIcon,
  MoreVert as MoreVertIcon,
  EventNote as EventNoteIcon,
  Info as InfoIcon,
  People as PeopleIcon
} from "@material-ui/icons";
import AuthenticationService from "../../accounts/AuthenticationService";

import PropTypes from "prop-types";
import {
  meetupPropType,
  userPropType,
  friendPropType,
} from "../../constants/prop-types";
import { Helmet } from "react-helmet";
import styles from "../../styles/meetup.module.css";

class Meetup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      meetupSocket: new WebSocketService(),
      editMeetupForm: false,
      newMeetupEventForm: false,
      showChat: props.isUserMember,
      anchor: null,
      isMobile: window.matchMedia("(max-width: 1100px)").matches,
      mobileTabIndex: 0
    };

    this.state.meetupSocket.addMeetupCallbacks(
      this.props.getMeetupEvents,
      this.props.addMeetupEvent,
      this.props.reloadMeetupEvent,
      this.props.voteMeetupEvent,
      this.props.decideMeetupEvent,
      this.props.deleteMeetupEvent,
      this.props.addMeetupMember,
      this.props.deleteMeetupMember,
      this.props.addEventOption,
      this.props.deleteEventOption,
      this.props.addMeetupActivity
    );
  }

  componentDidMount() {
    const handler = (e) => this.setState({ isMobile: e.matches });
    window.matchMedia("(max-width: 1100px)").addListener(handler);
    const uri = this.props.meetup.uri;
    const token = AuthenticationService.retrieveToken();
    const meetupPath = `/ws/meetups/${uri}/`;
    const meetupSocket = this.state.meetupSocket;
    meetupSocket.connect(meetupPath, token);

    this.props.getMeetupEvents(uri);
    if (!this.props.isFriendsInitialized) {
      this.props.getFriends(this.props.user.id);
    }

    // if (this.props.meetup.notifs > 0) {
    //   this.props.removeNotifs({ type: "meetup", id: this.props.meetup.id });
    // }
  }

  componentDidUpdate(prevProps){
    if (prevProps.meetup.events && this.props.meetup.events && (Object.keys(this.props.meetup.events).length > Object.keys(prevProps.meetup.events).length)) {
      const eventSection = document.getElementById("Events");
      eventSection.scrollTo({top: eventSection.scrollHeight, behavior: "smooth"})
    }
  }

  componentWillUnmount() {
    this.state.meetupSocket.disconnect();
  }

  handleDelete = () => {
    if (window.confirm("Are you sure you want to delete")) {
      this.props.deleteMeetup(this.props.meetup.uri);
    }
  };

  handleEmail = () => {
    this.props.sendMeetupEmails(this.props.meetup.uri);
  };

  handlePublicMeetupJoin = (e) => {
    this.props.handlePublicMeetupJoin(
      this.props.meetup.uri,
      this.props.user.email,
      () => this.setState({ showChat: true })
    );
  };

  handleLeaveMeetup = (e, email) => {
    e.stopPropagation();
    this.props.handleLeaveMeetup(
      this.props.meetup.uri,
      email,
      this.props.user.email
    );
  };

  handleMenuClick = (e) => {
    this.setState({anchor: e.currentTarget})
  }

  handleMenuClose  = () => {
    this.setState({anchor: null})
  }

  refreshFriendsList = () => {
    this.props.getFriends(this.props.user.id);
  };

  openFormModal = () => {
    this.setState({ editMeetupForm: !this.state.editMeetupForm });
  };

  openEventModal = () => {
    this.setState({ newMeetupEventForm: !this.state.newMeetupEventForm });
  };

  determineEmailDisable = (events) => {
    if (
      events === undefined ||
      (Object.keys(events).length === 0 && events.constructor === Object)
    ) {
      return true;
    }

    for (var key in events) {
      if (events[key].chosen === null) {
        return true;
      }
    }
    return false;
  };

  sortEvents = (events) => {
    const keys = Object.keys(events);
    keys.sort((a, b) => new Date(events[a].start) - new Date(events[b].start));
    return keys;
  };

  
  determineIsUserCreator = (id) => {
    return this.props.meetup.creator.id === id;
  };

  toggleChat = () => {
    this.setState({ showChat: !this.state.showChat });
  };

  handleMobileTabChange = (e, newValue) => {
    this.setState({mobileTabIndex: newValue})
  }

  render() {
    const meetup = this.props.meetup;
    const isUserMember = this.props.isUserMember;
    const isUserCreator = this.determineIsUserCreator(this.props.user.id);
    const emailDisable = this.determineEmailDisable(meetup.events);
    const isPast = moment(meetup.date).isBefore(moment(), 'day')

    return (
      <div className={`innerWrap  ${this.state.isMobile ? "innerWrap-mobile": ""}`}>
        <Helmet>
          <meta charSet="utf-8" />
          <title>{`${meetup.name}`}</title>
        </Helmet>
        <div className={`innerLeft ${this.state.isMobile ? "innerLeft-mobile": ""} ${this.state.mobileTabIndex === 0 ? "innerLeft-show" : ""}`}>
          <div className="innerLeftHeader">
            <span>{meetup.name}</span>
            {!isPast && 
              <>
                <span>
                  {(!isUserMember && !isPast) && 
                      <Button
                          aria-label="join-meetup"
                          onClick={this.handlePublicMeetupJoin}
                          style={{ background: "#45B649", color: "white" }}
                          variant="contained"
                          size="small"
                      >
                          Join Meetup
                      </Button>
                  }
                  <IconButton aria-label="meetup-menu" style={{color: "rgba(10,10,10, .95)"}} edge="end" onClick={this.handleMenuClick}>
                      <MoreVertIcon/>
                  </IconButton>
                </span>
                <Menu 
                    anchorEl={this.state.anchor} 
                    open={this.state.anchor} 
                    onClose={this.handleMenuClose}
                >
                    {isUserMember && !this.state.showChat && (
                        <MenuItem aria-label="chat" onClick={(e) => {this.toggleChat(); this.handleMenuClose(e);}}>
                            <ListItemIcon>
                                <ChatIcon  color="primary" fontSize="small" />
                            </ListItemIcon>
                            <Typography variant="body2" noWrap>
                                Chat Window
                            </Typography>
                        </MenuItem>
                    )}
                      {(isUserMember && !isUserCreator && !isPast) && 
                        <MenuItem
                            aria-label="leave-meetup"
                            onClick={(e) =>{
                              this.handleLeaveMeetup(e, this.props.user.email);
                              this.handleMenuClose(e);
                            }}
                        >
                          <ListItemIcon>
                            <ExitToAppIcon color="secondary" fontSize="small"/>
                          </ListItemIcon>
                          <Typography variant="body2" noWrap>
                            Leave Meetup
                          </Typography>
                        </MenuItem>
                    }
                    {isUserCreator && (
                      <>  
                        <MenuItem 
                            aria-label="email"
                            disabled={emailDisable} 
                            onClick={(e) => {
                                this.handleEmail();
                                this.handleMenuClose(e);
                            }}
                        >
                          <ListItemIcon>
                              <EmailIcon  style={{color: "black"}} fontSize="small" />
                          </ListItemIcon>
                          <Typography variant="body2" noWrap>
                              Send Email
                          </Typography>
                        </MenuItem>
                        <MenuItem aria-label="edit" onClick={(e) => {this.openFormModal(); this.handleMenuClose(e);}}>
                            <ListItemIcon>
                                <EditIcon style={{color: "black"}} fontSize="small" />
                            </ListItemIcon>
                            <Typography variant="body2" noWrap>
                                Edit Meetup
                            </Typography>
                        </MenuItem>
                        <MenuItem aria-label="delete" onClick={(e) => {this.handleDelete(); this.handleMenuClose(e);}}>
                            <ListItemIcon>
                                <DeleteIcon  color="secondary" fontSize="small" />
                            </ListItemIcon>
                            <Typography variant="body2" noWrap>
                                Delete Meetup
                            </Typography>
                        </MenuItem>
                    </>
                  )}
                </Menu>
              </>
            }
          </div>
          <div className="innerLeftHeaderBlock">
            <div className="hr">
              Outline
            </div>
            <MeetupTree
              meetup={meetup}
              sortEvents={(events) => this.sortEvents(events)}
              initialized={this.props.isMeetupEventsInitialized}
            />
          </div>
          <div className="innerLeftHeaderBlock">
            <div className="hr">
              Information
            </div>
            <div className="innerLeftHeaderBlockAction">
              <div className="blockActionHeader">
                Date
                <span className="blockActionChip">
                  {moment(meetup.date).format("dddd, MMMM D")}
                </span>
              </div>
            </div>
            <div className="innerLeftHeaderBlockAction">
              <div className="blockActionHeader" aria-label="location">
                Location
                <span className="blockActionChip">
                  {meetup.location}
                </span>
              </div>
            </div>
            <div className="innerLeftHeaderBlockAction">
              <div className="blockActionHeader" aria-label="meetup-type">
                Type
                <span className="blockActionChip">
                  {meetup.public ? "Public" : "Private"}
                </span>
              </div>
            </div>
          </div>
          {!this.state.isMobile && 
            <div className="innerLeftHeaderBlock">
              <div className="hr">
                Members
              </div>
              <MeetupMembers 
                isPast={isPast}
                friends={this.props.friends}
                isUserMember={isUserMember}
                leaveMeetup={this.handleLeaveMeetup}
                sendFriendInvite={this.props.sendFriendInvite}
                meetup={meetup}
                members={meetup.members}
                user={this.props.user}
              />
            </div>
          }
          <div className="innerLeftHeaderBlock">
            <div className="hr">
              Friends
              {!isPast && 
                <Tooltip title="Refresh">
                    <IconButton
                        style={{color: "black"}}
                        onClick={this.refreshFriendsList}
                        aria-label="refresh-friends"
                        size="small"
                    >
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
              }
            </div>
            <MeetupFriends
              friends={this.props.friends} 
              isPast={isPast}
              meetup={this.props.meetup}
              isFriendsFetching={this.props.isFriendsFetching}
            />
          </div>
        </div>
        <div className={`innerRight ${this.state.isMobile ? "innerRight-mobile": ""} ${this.state.mobileTabIndex === 3 ? "innerRight-show" : ""}`}>
          <div id="events-wrapper"></div>
          <div className="innerRightBlock" style={{overflowY:"auto"}} id="Events">
            {this.props.isMeetupEventsFetching && (
              <div className="loading">
                <CircularProgress size={30}/>
              </div>
            )}
            {this.props.isMeetupEventsInitialized &&
              meetup.events &&
              this.sortEvents(meetup.events).map((event, index) => (
                <MeetupEvent
                  key={event}
                  socket={this.state.meetupSocket}
                  uri={meetup.uri}
                  event={meetup.events[event]}
                  isUserMember={isUserMember}
                  coords={{
                    latitude: meetup.latitude,
                    longitude: meetup.longitude,
                  }}
                  isUserCreator={isUserCreator}
                  user={this.props.user}
                  isPast={isPast}
                  isMobile={this.state.isMobile}
                />
              ))}
          </div>
          {(!isPast && isUserMember && !this.state.isMobile) &&
              <div className={styles.addEvent}>
                <Tooltip title="Create Event">
                    <Fab
                      color="secondary"
                      aria-label="add-event"
                      size="medium"
                      onClick={this.openEventModal}
                    >
                        <AddIcon />
                    </Fab>
                </Tooltip>
              </div>
          }
        </div>
        {this.state.showChat && 
          <div className={`innerLeft ${this.state.isMobile ? "innerLeft-mobile": ""} ${this.state.mobileTabIndex === 4 ? "innerLeft-show" : ""} ${styles.meetupChatWrapper}`}  >
            <MeetupChat
              aria-label="meetup-chat"
              meetup={meetup}
              hideChat={this.toggleChat}
            />
          </div>
        }
        {this.state.isMobile &&
          <div className={`innerLeft ${this.state.isMobile ? "innerLeft-mobile": ""} ${this.state.mobileTabIndex === 1 ? "innerLeft-show" : ""}`}>
            <MeetupMembers 
              isPast={isPast}
              friends={this.props.friends}
              isUserMember={isUserMember}
              leaveMeetup={this.handleLeaveMeetup}
              sendFriendInvite={this.props.sendFriendInvite}
              meetup={meetup}
              members={meetup.members}
              user={this.props.user}
            />
          </div>
        }
        {this.state.isMobile && 
          <div className="innerWrap-mobileControl">
            <BottomNavigation value={this.state.mobileTabIndex} onChange={this.handleMobileTabChange} showLabels>
                <BottomNavigationAction label="Info" icon={<InfoIcon/>}/>
                <BottomNavigationAction label="Members" icon={<PeopleIcon/>}/>
                <Fab
                  className="mobileControl-Fab"
                  color="primary"
                  aria-label="add-event"
                  size="medium"
                  onClick={this.openEventModal}
                >
                  <AddIcon />
                </Fab>
                <BottomNavigationAction label="Events" icon={<EventNoteIcon/>}/>
                <BottomNavigationAction label="Chat" icon={<ChatIcon/>}/>
            </BottomNavigation>
          </div>
        }
        {this.state.editMeetupForm && (
            <MeetupForm
              type="edit"
              uri={this.props.meetup.uri}
              handleClose={this.openFormModal}
              open={this.state.editMeetupForm}
              aria-label="meetup-form"
            />
          )}
        {this.state.newMeetupEventForm && (
            <MeetupEventForm
              type="create"
              uri={meetup.uri}
              aria-label="add-event-form"
              handleClose={this.openEventModal}
              open={this.state.newMeetupEventForm}
            />
        )}
      </div>
    );
  }
}

Meetup.propTypes = {
  meetup: meetupPropType,
  user: userPropType,
  friends: PropTypes.arrayOf(friendPropType),
  isFriendsInitialized: PropTypes.bool.isRequired,
  isMeetupEventsInitialized: PropTypes.bool,
  deleteMeetup: PropTypes.func.isRequired,
  getFriends: PropTypes.func.isRequired,
  getMeetupEvents: PropTypes.func.isRequired,
  addMeetupEvent: PropTypes.func.isRequired,
  reloadMeetupEvent: PropTypes.func.isRequired,
  voteMeetupEvent: PropTypes.func.isRequired,
  decideMeetupEvent: PropTypes.func.isRequired,
  deleteMeetupEvent: PropTypes.func.isRequired,
  sendMeetupEmails: PropTypes.func.isRequired,
  removeNotifs: PropTypes.func.isRequired,
  addMeetupMember: PropTypes.func.isRequired,
  addGlobalMessage: PropTypes.func.isRequired,
  addEventOption: PropTypes.func.isRequired,
  sendFriendInvite: PropTypes.func.isRequired,
};

function mapStateToProps(state, ownProps) {
  return {
    user: state.user.user,
    friends: state.user.friends,
    isFriendsInitialized: state.user.isFriendsInitialized,
    isMeetupEventsInitialized:
      state.meetup.meetups[ownProps.meetup.uri].isMeetupEventsInitialized,
    isMeetupEventsFetching:
      state.meetup.meetups[ownProps.meetup.uri].isMeetupEventsFetching,
    isFriendsFetching: state.user.isFriendsFetching,
  };
}

const mapDispatchToProps = {
  deleteMeetup,
  getFriends,
  getMeetupEvents,
  addMeetupEvent,
  reloadMeetupEvent,
  voteMeetupEvent,
  decideMeetupEvent,
  deleteMeetupEvent,
  sendMeetupEmails,
  addMeetupMember,
  addGlobalMessage,
  addEventOption,
  sendFriendInvite,
  deleteEventOption,
  deleteMeetupMember,
  handlePublicMeetupJoin,
  handleLeaveMeetup,
};

export default connect(mapStateToProps, mapDispatchToProps)(Meetup);
export { Meetup as UnderlyingMeetup };
