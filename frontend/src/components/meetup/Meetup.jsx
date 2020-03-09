import React, {Component} from 'react'
import MeetupEvent from "./MeetupEvent"
import {connect} from 'react-redux';
import {deleteMeetup, getMeetupEvents, addMeetupEvent, sendMeetupEmails, deleteMeetupEvent, addMeetupMember, reloadMeetupEvent, voteMeetupEvent, decideMeetupEvent} from '../../actions/meetup';
import {removeNotifs} from '../../actions/notifications'
import {getFriends} from "../../actions/friend"
import {Link} from 'react-router-dom'
import moment from 'moment';
import MeetupFriend from "./MeetupFriend"
import {addGlobalMessage} from '../../actions/globalMessages'
import {Grid, Button, Typography, Avatar, List, ListItem, ListItemText, ListItemAvatar, IconButton} from "@material-ui/core"
import WebSocketService from "../../accounts/WebSocket"
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import RoomIcon from '@material-ui/icons/Room';
import ChatIcon from '@material-ui/icons/Chat';
import EmailIcon from '@material-ui/icons/Email';
import AddIcon from '@material-ui/icons/Add';
import TodayIcon from '@material-ui/icons/Today';
import AuthenticationService from "../../accounts/AuthenticationService"

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
        const path = `${ws_scheme}://localhost:8000/ws/meetups/${uri}/?token=${token}`;
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

    determineEmailDisable = (events) => {
        console.log(events)
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

    render () {
        const [id, name, uri, location, datetime, members, notifs, events] = this.props.meetup
        const isMember = (friend) => {return friend in members}
        const emailDisable = this.determineEmailDisable(events)
        
        const renderInformation = (name, datetime, location) => {
            return (
                <div className="inner-header">
                    <Typography variant="h5">{name}</Typography>
                    <div className="inner-header-middle">
                        <div className="inner-header-icons"><TodayIcon/> {moment(datetime).local().format("dddd, MMMM D")}</div>
                        <div className="inner-header-icons"><RoomIcon/> {location}</div>
                    </div>
                    <div>
                        <Link to={`/chat/${this.props.uri}`}>
                            <IconButton color="primary" aria-label='chat'>
                                <ChatIcon />
                            </IconButton>
                        </Link>
                        <IconButton onClick={!emailDisable ? () => this.handleEmail() : () => this.handleDisabledEmail(events)} style={!emailDisable ? {color: "black"} : {}} aria-label='email'>
                            <EmailIcon />
                        </IconButton>
                        <Link to={`/meetups/${uri}/edit`}>
                            <IconButton style={{color: "black"}} aria-label='edit' >
                                <EditIcon />
                            </IconButton>
                        </Link>
                        <IconButton onClick={() => this.handleDelete()} color="secondary" aria-label='delete'>
                            <DeleteIcon />
                        </IconButton>
                    </div>
                </div>
            )
        }

        const renderFriends = () => {
            return (
                <div className='outer-shell'>
                    <List style={{width: "100%"}}>
                        {this.props.friends.map((friend) => 
                            <MeetupFriend 
                            key={friend.id} 
                            friend={friend.user} 
                            isMember={isMember(friend.user.id)} 
                            uri={uri}/>
                        )}
                    </List>
                </div>
            )
        }

        const renderMembers = (members) => {
            return (

                <div className="outer-shell">
                    <List style={{width: "100%"}}>
                        {Object.keys(members).map((key) => 
                            <Link to={`/profile/${members[key].user.id}`}>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar src={members[key].user.avatar}>{members[key].user.first_name.charAt(0)}</Avatar>
                                    </ListItemAvatar>
                                    <ListItemText  primary={members[key].user.first_name} secondary={<>
                                        <Typography component="span" color="inherit" variant="body2"> 
                                            {members[key].user.email + " "}
                                        </Typography>
                                        </>
                                    }>
                                    </ListItemText>
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
                        <MeetupEvent number={index} socket={this.state.socket} key={event.id} uri={uri} event={events[event]}></MeetupEvent> 
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
                    <Grid item xs={6}>
                        <div className="inner-header">
                            <Typography variant="h5">Members</Typography>
                        </div>
                        {renderMembers(members)}
                    </Grid>
                    <Grid item xs={6}>
                        <div className="inner-header">
                            <Typography variant="h5">Friends</Typography>
                        </div>
                        {renderFriends()}
                    </Grid>
                    <Grid item xs={12}>
                        <div className="inner-header">
                            <Typography variant="h5">Events</Typography>
                            <Link socket={this.state.socket} to={`/meetups/${this.props.uri}/new`}><Button startIcon={<AddIcon />} className="button" variant="contained" color="primary">Event</Button></Link>
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