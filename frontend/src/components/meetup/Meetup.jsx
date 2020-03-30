import React, {Component} from 'react'
import {MeetupFriend, MeetupEvent} from '../components'
import {connect} from 'react-redux';
import {deleteMeetup, getMeetupEvents, addMeetupEvent, sendMeetupEmails, deleteMeetupEvent, addMeetupMember, reloadMeetupEvent, voteMeetupEvent, decideMeetupEvent} from '../../actions/meetup';
import {removeNotifs} from '../../actions/notifications'
import {getFriends} from "../../actions/friend"
import {Link} from 'react-router-dom'
import moment from 'moment';
import {addGlobalMessage} from '../../actions/globalMessages'
import {Grid, Button, Typography, Avatar, List, ListItem, ListItemText, ListItemAvatar, IconButton, Tooltip} from "@material-ui/core"
import WebSocketService from "../../accounts/WebSocket";
import {Delete as DeleteIcon, Edit as EditIcon, Room as RoomIcon, Chat as ChatIcon, VerifiedUser as VerifiedUserIcon, 
    Lock as LockIcon, Public as PublicIcon, Email as EmailIcon, Add as AddIcon, Today as TodayIcon} from '@material-ui/icons'
import AuthenticationService from "../../accounts/AuthenticationService"
import {axiosClient} from '../../accounts/axiosClient'

class Meetup extends Component {
    constructor(props){
        super(props)
        this.state = {
            socket: new WebSocketService()
        }
    }

    componentDidMount () {
        this.props.getMeetupEvents(this.props.uri)
        if (!this.props.isFriendsInitialized){
            this.props.getFriends(this.props.user.id)
        } 
       
        if (this.props.notifs > 0){
            this.props.removeNotifs({type: "meetup", id: this.props.id})
        }
        const uri = this.props.uri
        var ws_scheme = window.location.protocol === "https:" ? "wss": "ws"
        const token = AuthenticationService.retrieveToken()
        const path = `/ws/meetups/${uri}/?token=${token}`;
        const socket = this.state.socket
        socket.addEventCallbacks(this.props.getMeetupEvents, this.props.addMeetupEvent, this.props.reloadMeetupEvent, this.props.voteMeetupEvent, this.props.decideMeetupEvent, this.props.deleteMeetupEvent, this.props.addMeetupMember);
        socket.connect(path);
    }

    componentWillUnmount() {
        this.state.socket.disconnect()
    }
    
    handleDelete = () => {
        if (window.confirm("Are you sure you want to delete")){
            this.props.deleteMeetup(this.props.uri);
        }
    }

    handleEmail = () => {
        this.props.sendMeetupEmails(this.props.uri)
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
                `/api/meetups/${this.props.uri}/members/`, {email: this.props.user.email}, {headers: {
                    "Authorization": `JWT ${localStorage.getItem('token')}`
            }})
            console.log(response.data)
            this.props.addGlobalMessage("success", "Successfully joined meetup")
        }
        catch(e){
            this.props.addGlobalMessage("error", "Not able to join this meetup")
        }
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

    render () {
        const [id, name, uri, location, datetime, members, notifs, isPublic, categories, latitude, longitude, events] = this.props.meetup
        const isUserMember = this.determineIsUserMember(members)
        const emailDisable = this.determineEmailDisable(events)
        
        const renderInformation = (name, datetime, location) => {
            return (
                <div className="inner-header elevate">
                    <Typography variant="h5">{name}</Typography>
                    <div className="inner-header-middle">
                        <div className="inner-header-icons">
                            {isPublic ? 
                                <><PublicIcon/> Public</> :
                                <><LockIcon/> Private</>
                            }
                        </div>
                        <div className="inner-header-icons"><TodayIcon/> {moment(datetime).local().format("dddd, MMMM D")}</div>
                        <div className="inner-header-icons"><RoomIcon/> {location}</div>
                    </div>
                    {isUserMember && <div>
                        <Link to={`/chat/${this.props.uri}`}>
                            <Tooltip title="Chat">
                                <IconButton color="primary" aria-label='chat'>
                                    <ChatIcon/>
                                </IconButton>
                            </Tooltip>
                        </Link>
                        <Tooltip title="Email">
                            <IconButton onClick={!emailDisable ? () => this.handleEmail() : () => this.handleDisabledEmail(events)} style={!emailDisable ? {color: "black"} : {}} aria-label='email'>
                                <EmailIcon />
                            </IconButton>
                        </Tooltip>
                        <Link to={`/meetups/${uri}/edit`}>
                            <Tooltip title="Edit">
                                <IconButton style={{color: "black"}} aria-label='edit' >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                        </Link>
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
                                isMember={this.determineIsFriendMember(friend.user.id, members)} 
                                uri={uri}
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
                            <Link to={`/profile/${members[key].user.id}`}>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar src={members[key].user.avatar}>{members[key].user.first_name.charAt(0)}{members[key].user.last_name.charAt(0)}</Avatar>
                                    </ListItemAvatar>
                                    <ListItemText  primary={members[key].user.first_name} secondary={
                                            <>
                                                <Typography component="span" color="inherit" variant="body2"> 
                                                    {members[key].user.email + " "}
                                                </Typography>
                                            </>
                                        }>
                                    </ListItemText>
                                    {JSON.stringify(members[key].user) === JSON.stringify(this.props.user) && <VerifiedUserIcon style={{color: "#3f51b5"}}/>}
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
                        <MeetupEvent number={index} socket={this.state.socket} key={event.id} uri={uri} event={events[event]} isUserMember={isUserMember}></MeetupEvent> 
                    )}
                </>
            )
        }

        return (
            <div className="inner-wrap">
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        {renderInformation(name, datetime, location)}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <div className="inner-header elevate">
                            <Typography variant="h5">Members</Typography>
                            {!isUserMember && 
                                <Button onClick={this.handlePublicMeetupJoin} style={{background: "#45B649", color: "white"}} variant="contained">
                                    Join Meetup
                                </Button>}
                        </div>
                        {renderMembers(members)}
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
                                <Link socket={this.state.socket} to={`/meetups/${this.props.uri}/new`}>
                                    <Button startIcon={<AddIcon />} className="button rainbow" variant="contained" color="primary">
                                        Event
                                    </Button>
                                </Link>
                            }
                        </div>
                    </Grid>
                    <Grid item xs={12}>{renderEvents(events)}</Grid>
                </Grid>
            </div>
        )
    }
}

function mapStateToProps(state, ownProps){
    return {
       user: state.user.user,
       friends: state.user.friends,
       isFriendsInitialized: state.user.isFriendsInitialized,
       isMeetupEventsInitialized: state.meetup.meetups[ownProps.uri].isMeetupEventsInitialized
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
        addGlobalMessage
}

export default connect(mapStateToProps, mapDispatchToProps)(Meetup)