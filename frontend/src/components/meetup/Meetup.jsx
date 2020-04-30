import React, {Component} from 'react'
import {MeetupFriend, MeetupEvent, ProgressIcon, MeetupForm, MeetupChat, MeetupEventForm, MeetupTree} from '../components'
import {connect} from 'react-redux';
import {deleteMeetup, getMeetupEvents, addMeetupEvent, sendMeetupEmails, deleteMeetupEvent, deleteEventOption,
    addMeetupMember, deleteMeetupMember, addEventOption, reloadMeetupEvent, voteMeetupEvent, decideMeetupEvent,
    removeNotifs, getFriends, addGlobalMessage, sendFriendInvite, handleLeaveMeetup, handlePublicMeetupJoin
} from '../../actions';
import {Link} from 'react-router-dom'
import moment from 'moment';
import {Grid, Button, Typography, Avatar, List, ListItem, Paper, ListItemText, ListItemAvatar, IconButton, Tooltip, CircularProgress} from "@material-ui/core"
import WebSocketService from "../../accounts/WebSocket";
import {Delete as DeleteIcon, Edit as EditIcon, Room as RoomIcon, Chat as ChatIcon, VerifiedUser as VerifiedUserIcon, 
    Lock as LockIcon, Public as PublicIcon, Email as EmailIcon, Add as AddIcon, Today as TodayIcon, PersonAdd as PersonAddIcon,
    Refresh as RefreshIcon, Block as BlockIcon, ExitToApp as ExitToAppIcon, PersonAddDisabled as PersonAddDisabledIcon} from '@material-ui/icons'
import AuthenticationService from "../../accounts/AuthenticationService"
import {ReactComponent as Crown} from "../../assets/svgs/crown.svg"
import PropTypes from 'prop-types'
import {meetupPropType, userPropType, friendPropType} from '../../constants/prop-types'
import {Helmet} from 'react-helmet'
import styles from '../../styles/meetup.module.css'

class Meetup extends Component {
    constructor(props){
        super(props)
        this.state = {
            meetupSocket: new WebSocketService(),
            newMeetupForm: false,
            newMeetupEventForm: false,
            showChat: true
        }

        this.state.meetupSocket.addMeetupCallbacks(
            this.props.getMeetupEvents, this.props.addMeetupEvent, this.props.reloadMeetupEvent, 
            this.props.voteMeetupEvent, this.props.decideMeetupEvent, this.props.deleteMeetupEvent, 
            this.props.addMeetupMember, this.props.deleteMeetupMember, this.props.addEventOption, 
            this.props.deleteEventOption, this.props.addMeetupActivity
        );
    }

    componentDidMount() {
        const uri = this.props.meetup.uri
        const token = AuthenticationService.retrieveToken()
        const meetupPath = `/ws/meetups/${uri}/`;
        const meetupSocket = this.state.meetupSocket
        meetupSocket.connect(meetupPath, token);

        this.props.getMeetupEvents(uri)
        if (!this.props.isFriendsInitialized){
            this.props.getFriends(this.props.user.id)
        } 
    
        if (this.props.meetup.notifs > 0){
            this.props.removeNotifs({type: "meetup", id: this.props.meetup.id})
        }
    }
   
    componentWillUnmount() {
        this.state.meetupSocket.disconnect()
    }
    
    handleDelete = () => {
        if (window.confirm("Are you sure you want to delete")){
            this.props.deleteMeetup(this.props.meetup.uri);
        }
    }

    handleEmail = () => {
        this.props.sendMeetupEmails(this.props.meetup.uri)
    }

    handleDisabledEmail = (events) => {
        if (Object.keys(events).length === 0 && events.constructor === Object) {
            this.props.addGlobalMessage("error", "No events created yet")
        } else {
            this.props.addGlobalMessage("error", "All events must be decided to send email")
        }
    }

    handlePublicMeetupJoin = () => {
        this.props.handlePublicMeetupJoin(this.props.meetup.uri, this.props.user.email)
    }

    handleLeaveMeetup = (email) => {
        this.props.handleLeaveMeetup(this.props.meetup.uri, email, this.props.user.email)     
    }

    refreshFriendsList = () => {
        this.props.getFriends(this.props.user.id)
    }

    openFormModal = () => {
        this.setState({newMeetupForm: !this.state.newMeetupForm})
    }

    openEventModal = () => {
        this.setState({newMeetupEventForm: !this.state.newMeetupEventForm})
    }

    determineEmailDisable = (events) => {
        if (events === undefined || (Object.keys(events).length === 0 && events.constructor === Object)){
            return true
        }
    
        for (var key in events){
            if ((events[key].chosen) === null){
                return true
            }
        }
        return false
    }

    sortEvents = (events) => {
        const keys = Object.keys(events)
        keys.sort((a, b) => new Date(events[a].start) - new Date(events[b].start))
        return keys
    }

    determineIsFriendMember = (friend, members) => {
        return friend in members
    }

    determineIsUserCreator = (id) => {
        return this.props.meetup.creator.id === id
    }

    determineisMemberNotFriend = (user) => {
        if(this.props.friends.length === 0 || this.props.user.id === user.id){
            return false
        }

        for (var i = 0; i < this.props.friends.length; i++){
            let friend = this.props.friends[i]
            if (friend.user.id === user.id){
                return false
            }
        }
       
        return true
    }

    addFriend = (e, email) => {
        e.preventDefault()
        this.props.sendFriendInvite(email)
    }

    toggleChat = () => {
        this.setState({showChat: !this.state.showChat})
    }

    render () {
        const meetup =  this.props.meetup
        const isUserMember = this.props.isUserMember
        const isUserCreator = this.determineIsUserCreator(this.props.user.id)
        const emailDisable = this.determineEmailDisable(meetup.events)
        
        const renderInformation = (name, date, location) => {
            return (
                <Paper className={styles.header} elevation={3}>
                    <Typography variant="h5">{name}</Typography>
                    <div className={styles.headerInfo}>
                        <div className={styles.headerIcons}>
                            {meetup.public ? 
                                <><PublicIcon/> Public</> :
                                <><LockIcon/> Private</>
                            }
                        </div>
                        <div className={styles.headerIcons}>
                            <TodayIcon/> {moment(date).format("dddd, MMMM D")}
                        </div>
                        <div className={styles.headerIcons}>
                            <RoomIcon/> {location}
                        </div>
                    </div>
                    {(isUserMember && !this.state.showChat) && 
                        <Tooltip title="Chat">
                            <IconButton color="primary" onClick={this.toggleChat} aria-label='chat'>
                                <ChatIcon/>
                            </IconButton>
                        </Tooltip>
                    }
                    {isUserCreator && 
                        <div className={styles.actions}>
                        
                            <Tooltip title="Email">
                                <div style={{width: 48, minHeight: 48}}>
                                    <ProgressIcon 
                                        check={true}
                                        disabled={emailDisable}  
                                        icon={<EmailIcon />} 
                                        ariaLabel="email" 
                                        handleClick={!emailDisable ? 
                                            () => this.handleEmail() : 
                                            () => this.handleDisabledEmail(meetup.events)
                                        } 
                                    />
                                </div>
                            </Tooltip>
                            
                            <Tooltip title="Edit">
                                <IconButton onClick={this.openFormModal} style={{color: "black"}} aria-label='edit' >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Delete">
                                <IconButton onClick={() => this.handleDelete()} color="secondary" aria-label='delete'>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </div>
                    }
                    {this.state.newMeetupForm && 
                        <MeetupForm type="edit" uri={this.props.meetup.uri} handleClose={this.openFormModal} open={this.state.newMeetupForm}/>
                    }
                </Paper>
            )
        }

        const renderFriends = () => {
            return (
                <Paper className={styles.shell} elevation={3}>
                    <List className={styles.shellList}>
                        {this.props.friends.map((friend) => 
                            <MeetupFriend 
                                key={friend.id} 
                                friend={friend.user} 
                                isMember={this.determineIsFriendMember(friend.user.id, meetup.members)} 
                                uri={meetup.uri}
                            />
                        )}
                    </List>
                </Paper>
            )
        }

        const renderMembers = (members) => {
    
            return (
                <Paper className={styles.shell} elevation={3}>
                    <List className={styles.shellList}>
                        {Object.keys(members).map((key) => 
                            <Link key={key} to={`/profile/${members[key].user.id}`}>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar src={members[key].user.avatar}>
                                            {members[key].user.first_name.charAt(0)}
                                            {members[key].user.last_name.charAt(0)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={members[key].user.first_name} secondary={
                                            <>
                                                <Typography component="span" color="inherit" variant="body2"> 
                                                    {members[key].user.email + " "}
                                                </Typography>
                                            </>
                                        }>
                                    </ListItemText>
                                    {this.determineIsUserCreator(members[key].user.id) && 
                                        <Tooltip title="Creator">
                                            <Crown width={24} height={24}/>
                                        </Tooltip>
                                    }
                                    {members[key].ban && 
                                        <Tooltip title="Used Ban">
                                            <BlockIcon color="secondary"/>
                                        </Tooltip>
                                    }
                                
                                    {members[key].user.id === this.props.user.id && 
                                        <Tooltip title="You">
                                            <img style={{width: 20, height: 20, marginLeft: 10}} alt={"&#9787;"}
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
                                    {isUserMember && (members[key].user.id !== this.props.user.id && members[this.props.user.id].admin) &&
                                        <Tooltip title="Remove Member">
                                            <IconButton color="secondary" onClick={(e) => this.handleLeaveMeetup(e,members[key].user.email)}>
                                                <ExitToAppIcon/>
                                            </IconButton>
                                        </Tooltip>
                                    }
                                    {this.determineisMemberNotFriend(members[key].user) && 
                                        <Tooltip title="Add Friend">
                                            <IconButton color="primary" onClick={e => this.addFriend(e, members[key].user.email)}>
                                                <PersonAddIcon/>
                                            </IconButton>
                                        </Tooltip>
                                    }
                                </ListItem>
                            </Link>
                        )}
                    </List>
                </Paper>
            )
        }

        const renderEvents = (events) => {
            return (
                <>
                    {this.props.isMeetupEventsFetching && 
                        <div className="loading">
                            <CircularProgress/>
                        </div>
                    }
                    {this.props.isMeetupEventsInitialized && events && this.sortEvents(events).map((event, index) => 
                        <MeetupEvent key={event} number={index} socket={this.state.meetupSocket}  
                            uri={meetup.uri} event={events[event]} isUserMember={isUserMember} 
                            coords={{latitude: meetup.latitude, longitude: meetup.longitude}}
                            isUserCreator={isUserCreator} user={this.props.user}
                        />
                    )}
                </>
            )
        }

        return (
            <div className={styles.meetupWrapper}>
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>
                        {`${meetup.name}`}
                    </title>
                </Helmet>
                <MeetupTree 
                    meetup={meetup} 
                    sortEvents={(events) => this.sortEvents(events)} 
                    initialized={this.props.isMeetupEventsInitialized}
                />
                <div className={styles.meetupWrapperInner} id='head'>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            {renderInformation(meetup.name, meetup.date, meetup.location)}
                        </Grid>
                        <Grid item xs={12} md={6} id="Members">
                            <Paper className={styles.header} elevation={3}>
                                <Typography variant="h5">Members</Typography>
                                {!isUserMember && 
                                    <Button onClick={this.handlePublicMeetupJoin} style={{background: "#45B649", color: "white"}} variant="contained">
                                        Join Meetup
                                    </Button>
                                }
                                {(isUserMember && !isUserCreator )&& 
                                    <Button onClick={(e) => this.handleLeaveMeetup(e, this.props.user.email)} variant="contained" color="secondary"> 
                                        Leave Meetup
                                    </Button>
                                }
                            </Paper>
                            {renderMembers(meetup.members)}
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper className={styles.header} elevation={3}>
                                <Typography variant="h5">Friends</Typography>
                                <Tooltip title="Refresh">
                                    <IconButton color="primary" onClick={this.refreshFriendsList}>
                                        <RefreshIcon/>
                                    </IconButton>
                                </Tooltip>
                            </Paper>
                            {renderFriends()}
                        </Grid>
                        <Grid item xs={12}>
                            <Paper className={styles.header} elevation={3} id="Events">
                                <Typography variant="h5">Events</Typography>
                                {isUserMember && 
                                    <Button onClick={this.openEventModal} startIcon={<AddIcon />} className="button rainbow" variant="contained" color="primary">
                                        Event
                                    </Button>
                                }
                                {this.state.newMeetupEventForm && 
                                    <MeetupEventForm 
                                        type="create" uri={meetup.uri} handleClose={this.openEventModal}
                                        open={this.state.newMeetupEventForm}
                                    />
                                }
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            {renderEvents(meetup.events)}
                        </Grid>
                    </Grid>
                </div>
                {this.state.showChat && <MeetupChat meetup={meetup} hideChat={this.toggleChat}/>}
            </div>
        )
    }
}

Meetup.propTypes = {
    meetup: meetupPropType,
    user: userPropType, friends: PropTypes.arrayOf(friendPropType),
    isFriendsInitialized: PropTypes.bool.isRequired, isMeetupEventsInitialized: PropTypes.bool,
    deleteMeetup: PropTypes.func.isRequired, getFriends: PropTypes.func.isRequired,
    getMeetupEvents: PropTypes.func.isRequired, addMeetupEvent: PropTypes.func.isRequired,
    reloadMeetupEvent: PropTypes.func.isRequired, voteMeetupEvent: PropTypes.func.isRequired,
    decideMeetupEvent: PropTypes.func.isRequired, deleteMeetupEvent: PropTypes.func.isRequired,
    sendMeetupEmails: PropTypes.func.isRequired, removeNotifs: PropTypes.func.isRequired,
    addMeetupMember: PropTypes.func.isRequired, addGlobalMessage: PropTypes.func.isRequired,
    addEventOption: PropTypes.func.isRequired, sendFriendInvite: PropTypes.func.isRequired
}

function mapStateToProps(state, ownProps){
    return {
       user: state.user.user,
       friends: state.user.friends,
       isFriendsInitialized: state.user.isFriendsInitialized,
       isMeetupEventsInitialized: state.meetup.meetups[ownProps.meetup.uri].isMeetupEventsInitialized,
       isMeetupEventsFetching: state.meetup.meetups[ownProps.meetup.uri].isMeetupEventsFetching
    }
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
    handleLeaveMeetup
}

export default connect(mapStateToProps, mapDispatchToProps)(Meetup)
export {Meetup as UnderlyingMeetup}