import React, {Component} from 'react'
import {MeetupFriend, MeetupEvent, ProgressIcon, MeetupForm, MeetupEventForm} from '../components'
import {connect} from 'react-redux';
import {deleteMeetup, getMeetupEvents, addMeetupEvent, sendMeetupEmails, deleteMeetupEvent, addMeetupMember, addEventOption, reloadMeetupEvent, voteMeetupEvent, decideMeetupEvent} from '../../actions/meetup';
import {removeNotifs} from '../../actions/notifications'
import {getFriends} from "../../actions/friend"
import {addGlobalMessage} from '../../actions/globalMessages'
import {sendFriendInvite} from "../../actions/invite"
import {Link} from 'react-router-dom'
import moment from 'moment';
import {Grid, Button, Typography, Avatar, List, ListItem, ListItemText, ListItemAvatar, IconButton, Tooltip} from "@material-ui/core"
import WebSocketService from "../../accounts/WebSocket";
import {Delete as DeleteIcon, Edit as EditIcon, Room as RoomIcon, Chat as ChatIcon, VerifiedUser as VerifiedUserIcon, 
    Lock as LockIcon, Public as PublicIcon, Email as EmailIcon, Add as AddIcon, Today as TodayIcon, PersonAdd as PersonAddIcon} from '@material-ui/icons'
import AuthenticationService from "../../accounts/AuthenticationService"
import {axiosClient} from '../../accounts/axiosClient'
import PropTypes from 'prop-types'
import {meetupPropType, userPropType, friendPropType} from '../../constants/prop-types'
import {Helmet} from 'react-helmet'

class Meetup extends Component {
    constructor(props){
        super(props)
        this.state = {
            socket: new WebSocketService(),
            newMeetupForm: false,
            newMeetupEventForm: false
        }
    }

    componentDidMount () {
        const uri = this.props.meetup.uri
        this.props.getMeetupEvents(uri)
        if (!this.props.isFriendsInitialized){
            this.props.getFriends(this.props.user.id)
        } 
       
        if (this.props.meetup.notifs > 0){
            this.props.removeNotifs({type: "meetup", id: this.props.id})
        }
        const token = AuthenticationService.retrieveToken()
        const path = `/ws/meetups/${uri}/`;
        const socket = this.state.socket
        socket.addEventCallbacks(this.props.getMeetupEvents, this.props.addMeetupEvent, this.props.reloadMeetupEvent, 
            this.props.voteMeetupEvent, this.props.decideMeetupEvent, this.props.deleteMeetupEvent, 
            this.props.addMeetupMember, this.props.addEventOption);
        socket.connect(path, token);
    }

    componentWillUnmount() {
        this.state.socket.disconnect()
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

    handlePublicMeetupJoin = async () => {
        try {
            const response = await axiosClient.post(
                `/api/meetups/${this.props.meetup.uri}/members/`, {email: this.props.user.email}, {headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
            }})
            console.log(response.data)
            this.props.addGlobalMessage("success", "Successfully joined meetup")
        }
        catch(e){
            this.props.addGlobalMessage("error", "Not able to join this meetup")
        }
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

    determineIsUserMember = (members) => {
        var isUserMember = false;
        for (var key of Object.keys(members)){
            const member = members[key]
            if (member.user.id === this.props.user.id){
                isUserMember = true
            }
        }
        return isUserMember
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

    render () {
        const meetup =  this.props.meetup
        const isUserMember = this.determineIsUserMember(meetup.members)
        const emailDisable = this.determineEmailDisable(meetup.events)
        
        const renderInformation = (name, date, location) => {
            return (
                <div className="inner-header elevate">
                    <Typography variant="h5">{name}</Typography>
                    <div className="inner-header-middle">
                        <div className="inner-header-icons">
                            {meetup.public ? 
                                <><PublicIcon/> Public</> :
                                <><LockIcon/> Private</>
                            }
                        </div>
                        <div className="inner-header-icons"><TodayIcon/> {moment(date).format("dddd, MMMM D")}</div>
                        <div className="inner-header-icons"><RoomIcon/> {location}</div>
                    </div>
                    {isUserMember && <div className="meetup-actions">
                        <Link to={`/chat/${this.props.meetup.uri}`}>
                            <Tooltip title="Chat">
                                <IconButton color="primary" aria-label='chat'>
                                    <ChatIcon/>
                                </IconButton>
                            </Tooltip>
                        </Link>
                        <Tooltip title="Email">
                            <div style={{width: 48, minHeight: 48}}>
                                <ProgressIcon 
                                    disabled={emailDisable}  icon={<EmailIcon />} ariaLabel="email" check={true}
                                    handleClick={!emailDisable ? () => this.handleEmail() : () => this.handleDisabledEmail(meetup.events)} 
                                />
                            </div>
                        </Tooltip>
                        
                        <Tooltip title="Edit">
                            <IconButton onClick={this.openFormModal} style={{color: "black"}} aria-label='edit' >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        {this.state.newMeetupForm && 
                            <MeetupForm type="edit" uri={this.props.meetup.uri} handleClose={this.openFormModal} open={this.state.newMeetupForm}/>
                        }
                        <Tooltip title="Delete">
                            <IconButton onClick={() => this.handleDelete()} color="secondary" aria-label='delete'>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </div>}
                </div>
            )
        }

        const renderFriends = () => {
            return (
                <div className='outer-shell elevate'>
                    <List style={{width: "100%", padding: "0"}}>
                        {this.props.friends.map((friend) => 
                            <MeetupFriend 
                                key={friend.id} 
                                friend={friend.user} 
                                isMember={this.determineIsFriendMember(friend.user.id, meetup.members)} 
                                uri={meetup.uri}
                            />
                        )}
                    </List>
                </div>
            )
        }

        const renderMembers = (members) => {
    
            return (
                <div className="outer-shell elevate">
                    <List style={{width: "100%", padding: "0"}}>
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
                                    {members[key].user.id === this.props.user.id && 
                                        <Tooltip title="You">
                                            <VerifiedUserIcon style={{color: "#3f51b5"}}/>
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
                </div>
            )
        }

        const renderEvents = (events) => {
            return (
                <>
                    {!this.props.isMeetupEventsInitialized && <div>Initializing Events</div>}
                    {this.props.isMeetupEventsInitialized && events && this.sortEvents(events).map((event, index) => 
                        <MeetupEvent key={event.id} number={index} socket={this.state.socket}  
                            uri={meetup.uri} event={events[event]} isUserMember={isUserMember} 
                            coords={{latitude: meetup.latitude, longitude: meetup.longitude}}
                        />
                    )}
                </>
            )
        }

        return (
            <div className="inner-wrap">
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>{`${meetup.name}`}</title>
                </Helmet>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        {renderInformation(meetup.name, meetup.date, meetup.location)}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <div className="inner-header elevate">
                            <Typography variant="h5">Members</Typography>
                            {!isUserMember && 
                                <Button onClick={this.handlePublicMeetupJoin} style={{background: "#45B649", color: "white"}} variant="contained">
                                    Join Meetup
                                </Button>}
                        </div>
                        {renderMembers(meetup.members)}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <div className="inner-header elevate">
                            <Typography variant="h5">Friends</Typography>
                        </div>
                        {renderFriends()}
                    </Grid>
                    <Grid item xs={12}>
                        <div className="inner-header elevate">
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
                        </div>
                    </Grid>
                    <Grid item xs={12}>{renderEvents(meetup.events)}</Grid>
                </Grid>
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
       isMeetupEventsInitialized: state.meetup.meetups[ownProps.meetup.uri].isMeetupEventsInitialized
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
        sendFriendInvite
}

export default connect(mapStateToProps, mapDispatchToProps)(Meetup)