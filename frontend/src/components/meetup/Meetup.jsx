import React, { Component } from "react";
import {
  MeetupFriend,
  MeetupEvent,
  MeetupForm,
  MeetupChat,
  MeetupEventForm,
  MeetupTree,
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
  removeNotifs,
  getFriends,
  addGlobalMessage,
  sendFriendInvite,
  handleLeaveMeetup,
  handlePublicMeetupJoin,
} from "../../actions";
import { Link } from "react-router-dom";
import moment from "moment";
import {
  Grid,
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
  ListItemIcon
} from "@material-ui/core";
import WebSocketService from "../../accounts/WebSocket";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Room as RoomIcon,
  Chat as ChatIcon,
  VerifiedUser as VerifiedUserIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  Email as EmailIcon,
  Add as AddIcon,
  Today as TodayIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon,
  Block as BlockIcon,
  ExitToApp as ExitToAppIcon,
  PersonAddDisabled as PersonAddDisabledIcon,
  MoreVert as MoreVertIcon
} from "@material-ui/icons";
import AuthenticationService from "../../accounts/AuthenticationService";
import { ReactComponent as Crown } from "../../assets/svgs/crown.svg";
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
      anchor: null
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
    const uri = this.props.meetup.uri;
    const token = AuthenticationService.retrieveToken();
    const meetupPath = `/ws/meetups/${uri}/`;
    const meetupSocket = this.state.meetupSocket;
    meetupSocket.connect(meetupPath, token);

    this.props.getMeetupEvents(uri);
    if (!this.props.isFriendsInitialized) {
      this.props.getFriends(this.props.user.id);
    }

    if (this.props.meetup.notifs > 0) {
      this.props.removeNotifs({ type: "meetup", id: this.props.meetup.id });
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

  determineIsFriendMember = (friend, members) => {
    return friend in members;
  };

  determineIsUserCreator = (id) => {
    return this.props.meetup.creator.id === id;
  };

  determineisMemberNotFriend = (user) => {
    if (this.props.friends.length === 0 || this.props.user.id === user.id) {
      return false;
    }

    for (var i = 0; i < this.props.friends.length; i++) {
      let friend = this.props.friends[i];
      if (friend.user.id === user.id) {
        return false;
      }
    }

    return true;
  };

  addFriend = (e, email) => {
    e.preventDefault();
    this.props.sendFriendInvite(email);
  };

  toggleChat = () => {
    this.setState({ showChat: !this.state.showChat });
  };

  render() {
    const meetup = this.props.meetup;
    const isUserMember = this.props.isUserMember;
    const isUserCreator = this.determineIsUserCreator(this.props.user.id);
    const emailDisable = this.determineEmailDisable(meetup.events);
    const isPast = moment(meetup.date).isBefore(moment(), 'day')
    console.log(isPast)

    const renderInformation = (name, date, location) => {
      return (
        <div className={`${styles.header} elevate`}>
          <Typography variant="h4">{name}</Typography>
         
            <div className={styles.headerIcons}>
              <TodayIcon /> {moment(date).format("dddd, MMMM D")}
            </div>
            <div className={styles.headerIcons} aria-label="location">
              <RoomIcon /> {location}
            </div>
            <div className={styles.headerIcons} aria-label="meetup-type">
              {meetup.public ? (
                <>
                  <PublicIcon /> Public
                </>
              ) : (
                <>
                  <LockIcon /> Private
                </>
              )}
            </div>      
            <div className={styles.actions}>
                {!isPast && 
                    <>
                    <IconButton aria-label="meetup-menu" style={{color: "rgba(10,10,10, .95)"}} edge="end" onClick={this.handleMenuClick}>
                        <MoreVertIcon/>
                    </IconButton>
                    <Menu 
                        anchorEl={this.state.anchor} 
                        open={this.state.anchor} 
                        onClose={this.handleMenuClose}
                    >
                        {isUserMember && !this.state.showChat && (
                            <MenuItem onClick={(e) => {this.toggleChat(); this.handleMenuClose(e);}}>
                                <ListItemIcon>
                                    <ChatIcon aria-label="chat" color="primary" fontSize="small" />
                                </ListItemIcon>
                                <Typography variant="body2" noWrap>
                                    Chat Window
                                </Typography>
                            </MenuItem>
                        )}
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
          {this.state.editMeetupForm && (
            <MeetupForm
              type="edit"
              uri={this.props.meetup.uri}
              handleClose={this.openFormModal}
              open={this.state.editMeetupForm}
              aria-label="meetup-form"
            />
          )}
        </div>
      );
    };

    const renderFriends = () => {
      return (
        <div className={`${styles.shell} elevate`}>
          <List className={styles.shellList}>
            {this.props.isFriendsFetching && (
              <div className="loading">
                <CircularProgress size={30}/>
              </div>
            )}
            {this.props.friends.map((friend) => (
              <MeetupFriend
                key={friend.id}
                friend={friend.user}
                isMember={this.determineIsFriendMember(
                  friend.user.id,
                  meetup.members
                )}
                isPast={isPast}
                uri={meetup.uri}
              />
            ))}
          </List>
        </div>
      );
    };

    const renderMembers = (members) => {
      return (
        <div className={`${styles.shell} elevate`}>
          <List className={styles.shellList}>
            {Object.keys(members).map((key) => (
              <Link key={key} to={`/profile/${members[key].user.id}`}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={members[key].user.avatar}>
                      {members[key].user.first_name.charAt(0)}
                      {members[key].user.last_name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={members[key].user.first_name}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          color="inherit"
                          variant="body2"
                        >
                          {members[key].user.email + " "}
                        </Typography>
                      </>
                    }
                  ></ListItemText>
                  {this.determineIsUserCreator(members[key].user.id) && (
                    <Tooltip title="Meetup Creator">
                      <Crown width={24} height={24} />
                    </Tooltip>
                  )}
                  {members[key].ban && (
                    <Tooltip title="Used Ban">
                      <BlockIcon color="secondary" />
                    </Tooltip>
                  )}

                  {(members[key].user.id === this.props.user.id && !isUserCreator) &&
                    <Tooltip title="You">
                      <img
                        style={{ width: 20, height: 20, marginLeft: 10 }}
                        alt={"&#9787;"}
                        src={`https://meetup-static.s3-us-west-1.amazonaws.com/static/general/panda.png`}
                      />
                    </Tooltip>
                  }
                  {/* {members[key].admin && 
                                        <Tooltip title="Admin">
                                            <VerifiedUserIcon style={{color: "#3f51b5"}}/>
                                        </Tooltip>
                                    } */}
                  {/* {(isUserCreator && members[key].admin && this.props.user.id !== members[key].user.id) &&  
                        <Tooltip title="Demote Admin">
                            <IconButton>
                                <PersonAddDisabledIcon/>
                            </IconButton>
                    </Tooltip> }
                    {(isUserCreator && !members[key].admin && this.props.user.id !== members[key].user.id) &&
                        <Tooltip title="Make Admin">
                            <IconButton>
                                <PersonAddIcon/>
                            </IconButton>
                        </Tooltip>
                    } */}
                  {isUserMember && !isPast &&
                    members[key].user.id !== this.props.user.id &&
                    members[this.props.user.id].admin && (
                      <Tooltip title="Remove Member">
                        <IconButton
                          aria-label="remove-member"
                          color="secondary"
                          onClick={(e) =>
                            this.handleLeaveMeetup(e, members[key].user.email)
                          }
                        >
                          <ExitToAppIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  {this.determineisMemberNotFriend(members[key].user) && (
                    <Tooltip title="Add Friend">
                      <IconButton
                        color="primary"
                        onClick={(e) =>
                          this.addFriend(e, members[key].user.email)
                        }
                      >
                        <PersonAddIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItem>
              </Link>
            ))}
          </List>
        </div>
      );
    };

    const renderEvents = (events) => {
      return (
        <>
          {this.props.isMeetupEventsFetching && (
            <div className="loading">
              <CircularProgress size={30}/>
            </div>
          )}
          {this.props.isMeetupEventsInitialized &&
            events &&
            this.sortEvents(events).map((event, index) => (
              <MeetupEvent
                key={event}
                socket={this.state.meetupSocket}
                uri={meetup.uri}
                event={events[event]}
                isUserMember={isUserMember}
                coords={{
                  latitude: meetup.latitude,
                  longitude: meetup.longitude,
                }}
                isUserCreator={isUserCreator}
                user={this.props.user}
                isPast={isPast}
              />
            ))}
        </>
      );
    };

    return (
      <div className={styles.meetupWrapper}>
        <Helmet>
          <meta charSet="utf-8" />
          <title>{`${meetup.name}`}</title>
        </Helmet>
        <MeetupTree
          meetup={meetup}
          sortEvents={(events) => this.sortEvents(events)}
          initialized={this.props.isMeetupEventsInitialized}
        />
        <div className={styles.meetupWrapperInner} id="head">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {renderInformation(meetup.name, meetup.date, meetup.location)}
            </Grid>
            <Grid item xs={12} sm={6} id="Members">
              <div className={styles.headerIndented}>
                <div className={`${styles.header} elevate`}>
                    <Typography variant="h5">Members</Typography>
                    {(!isUserMember && !isPast) && 
                        <Button
                            aria-label="join-meetup"
                            onClick={this.handlePublicMeetupJoin}
                            style={{ background: "#45B649", color: "white" }}
                            variant="contained"
                        >
                            Join Meetup
                        </Button>
                    }
                    {(isUserMember && !isUserCreator && !isPast) && 
                        <Button
                            color="secondary"
                            variant="contained"
                            aria-label="leave-meetup"
                            onClick={(e) =>
                            this.handleLeaveMeetup(e, this.props.user.email)
                            }
                        >
                            Leave Meetup
                        </Button>
                    }
                </div>
              </div>
              {renderMembers(meetup.members)}
            </Grid>
            <Grid item xs={12} sm={6}>
                <div className={styles.headerIndented}>
                    <div className={`${styles.header} elevate`}>
                        <Typography variant="h5">Friends</Typography>
                        {!isPast && 
                        <Tooltip title="Refresh">
                            <IconButton
                                style={{color: "black"}}
                                onClick={this.refreshFriendsList}
                                aria-label="refresh-friends"
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        }
                    </div>
                </div>
                {renderFriends()}
            </Grid>
            <Grid item xs={12}>
                <div className="hr" id="Events" style={{fontSize: "1rem"}}>
                    Events
                </div>
            </Grid>
            <Grid item xs={12}>
              {renderEvents(meetup.events)}
            </Grid>
          </Grid>
        </div>
        {!isPast && <div className={styles.addEvent}>
            {isUserMember && (
                <Tooltip title="Create Event">
                    <Fab
                        aria-label="add-event"
                        size="medium"
                        onClick={this.openEventModal}
                    >
                        <AddIcon />
                    </Fab>
                </Tooltip>
            )}
          </div>
        }
        {this.state.showChat && (
          <MeetupChat
            aria-label="meetup-chat"
            meetup={meetup}
            hideChat={this.toggleChat}
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
  removeNotifs,
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
