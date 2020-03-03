import React, {Component} from 'react'
import MeetupEvent from "./MeetupEvent"
import {connect} from 'react-redux';
import {deleteMeetup, getMeetupEvents, addMeetupEvent, sendMeetupEmails, deleteMeetupEvent, reloadMeetupEvent, voteMeetupEvent, decideMeetupEvent} from '../../actions/meetup';
import {removeNotifs} from '../../actions/notifications'
import {getFriends} from "../../actions/friend"
import {Link} from 'react-router-dom'
import moment from 'moment';
import MeetupFriend from "./MeetupFriend"
import {Grid, Paper, Button, Typography, Avatar, List, ListItem, ListItemText, Divider, ListItemAvatar} from "@material-ui/core"
import WebSocketService from "../../accounts/WebSocket"
import ScheduleIcon from '@material-ui/icons/Schedule';
import DeleteIcon from '@material-ui/icons/Delete';
import RoomIcon from '@material-ui/icons/Room';
import ChatIcon from '@material-ui/icons/Chat';
import EmailIcon from '@material-ui/icons/Email';
import AddIcon from '@material-ui/icons/Add';

class Meetup extends Component {
    constructor(props){
        super(props)
        this.state = {
            socket: new WebSocketService()
        }
    }

    componentDidMount () {
        this.props.getMeetupEvents(this.props.uri)
        this.props.getFriends(this.props.user.id)
        if (this.props.notifs > 0){
            this.props.removeNotifs({type: "meetup", id: this.props.id})
        }
        const uri = this.props.uri
        var ws_scheme = window.location.protocol === "https:" ? "wss": "ws"
        const path = `${ws_scheme}://localhost:8000/ws/meetups/${uri}/`;
        const socket = this.state.socket
        socket.addEventCallbacks(this.props.getMeetupEvents, this.props.addMeetupEvent, this.props.reloadMeetupEvent, this.props.voteMeetupEvent, this.props.decideMeetupEvent, this.props.deleteMeetupEvent);
        socket.connect(path);
    }

    componentWillUnmount() {
        this.state.socket.disconnect()
    }
    
    handleDelete = () => {
        this.props.deleteMeetup(this.props.uri);
    }

    handleEmail = () => {
        this.props.sendMeetupEmails(this.props.uri)
    }

    render () {
        const [id, name, uri, location, datetime, members, notifs, events] = this.props.meetup

        const isMember = (friend) => {
            return friend in members
        }
        
        const renderInformation = (name, datetime, location) => {
            return (
                <div className="inner-header">
                    <Typography variant="h5">{name}</Typography>
                    <div className="inner-header-middle">
                        <div className="inner-header-icons"><ScheduleIcon/> {moment(datetime).local().format("dddd, MMMM D")}</div>
                        <div className="inner-header-icons"><RoomIcon/> {location}</div>
                    </div>
                    <div>
                        <Link to={`/chat/${this.props.uri}`}><Button startIcon={<ChatIcon />} className="button" color="primary" variant="contained">Chat</Button></Link>
                        <Button startIcon={<EmailIcon />} className="button" variant="contained" onClick={() => this.handleEmail()}>Notify</Button>
                        <Button startIcon={<DeleteIcon />} className="button" variant="contained" color="secondary" onClick={() => this.handleDelete()}>Delete</Button>
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
                            <Link to={`/profile/${members[key].id}`}>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar src={members[key].avatar}/>
                                    </ListItemAvatar>
                                    <ListItemText  primary={members[key].first_name} secondary={<>
                                        <Typography component="span" color="inherit" variant="body2"> 
                                            {members[key].email + " "}
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
                    {this.props.isMeetupEventsInitialized && events && Object.keys(events).map((event, index) => 
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

function mapStateToProps(state){
    return {
       user: state.user.user,
       friends: state.user.friends,
       isFriendsInitialized: state.user.isFriendsInitialized,
       isMeetupEventsInitialized: state.meetup.isMeetupEventsInitialized
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
    removeNotifs
}

export default connect(mapStateToProps, mapDispatchToProps)(Meetup)