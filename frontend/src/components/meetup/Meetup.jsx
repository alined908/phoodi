import React, {Component} from 'react'
import MeetupEvent from "./MeetupEvent"
import {connect} from 'react-redux';
import {deleteMeetup, getMeetupEvents, addMeetupEvent, sendMeetupEmails, deleteMeetupEvent, reloadMeetupEvent, voteMeetupEvent, decideMeetupEvent} from '../../actions/meetup';
import {getFriends} from "../../actions/friend"
import {Link} from 'react-router-dom'
import moment from 'moment';
import MeetupFriend from "./MeetupFriend"
import {Grid, Paper, Button} from "@material-ui/core"
import WebSocketInstance from "../../accounts/WebSocket"

class Meetup extends Component {
    constructor(props){
        super(props)

        //Websocket create connection for meetu
        const uri = props.uri
        var ws_scheme = window.location.protocol === "https:" ? "wss": "ws"
        const path = `${ws_scheme}://localhost:8000/ws/meetups/${uri}/`;
        WebSocketInstance.connect(path);
        WebSocketInstance.addEventCallbacks(this.props.getMeetupEvents, this.props.addMeetupEvent, this.props.reloadMeetupEvent, this.props.voteMeetupEvent, this.props.decideMeetupEvent, this.props.deleteMeetupEvent);
    }

    componentDidMount () {
        this.props.getMeetupEvents(this.props.uri)
        this.props.getFriends()
    }
    
    handleDelete = () => {
        this.props.deleteMeetup(this.props.uri);
    }

    handleEmail = () => {
        this.props.sendMeetupEmails(this.props.uri)
    }

    handleCalendar = () => {
        console.log("handle calendar")
    }

    render () {
        const [id, name, uri, location, datetime, members, events] = this.props.meetup

        const isMember = (friend) => {
            return friend in members
        }
        
        const renderInformation = (name, datetime, location) => {
            return (
                <Paper elevation={3}>
                    <div className="title">{name}</div>
                    <div>{moment(datetime).local().format("MMM DD h:mm A")}</div>
                    <div>{location}</div>
                </Paper>
            )
        }

        const renderFriends = () => {
            return (
                <Paper elevation={3}>
                    {this.props.isFriendsInitialized && <div className="title">Friends</div>}
                    {this.props.isFriendsInitialized && this.props.friends.map((friendship) => <MeetupFriend key={friendship.id} friend={friendship.user} isMember={isMember(friendship.user.id)} uri={uri}></MeetupFriend>)}
                </Paper>
            )
        }

        const renderMembers = (members) => {
            return (
                <Paper elevation={3}>
                    <div className="title">Members</div>
                    {Object.keys(members).map((key) => <div key={members[key].id}>{members[key].email + " "}</div>)}
                </Paper>
            )
        }

        const renderEvents = (events) => {
            return (
                <div>
                    {!this.props.isMeetupEventsInitialized && <div>Initializing Events</div>}
                    {this.props.isMeetupEventsInitialized && events && Object.keys(events).map((event) => 
                        <MeetupEvent key={event.id} uri={uri} event={events[event]}></MeetupEvent> 
                    )}
                </div>
            )
        }

        const renderActions = () => {
            return (
                <Paper elevation={3}>
                    <Link to={`/meetups/${this.props.uri}/new`}><Button className="button" variant="contained" color="primary">Add Event</Button></Link>
                    <Button className="button" variant="contained" color="secondary" onClick={() => this.handleDelete()}>Delete Meetup</Button>
                    <Button className="button" variant="contained" onClick={() => this.handleEmail()}>Email Members</Button>
                    <Button className="button" variant="contained" onClick={() => this.handleCalendar()}>Add to Calendar</Button>
                </Paper>
            )
        }

        return (
            <div className="meetup">
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        {renderInformation(name, datetime, location)}
                    </Grid>
                    <Grid item xs={6}>
                        {renderMembers(members)}
                    </Grid>
                    <Grid item xs={12}>
                        {renderEvents(events)}
                    </Grid>
                    <Grid item xs={6}>
                        {renderFriends()}
                    </Grid>
                    <Grid item xs={6}>
                        {renderActions()}
                    </Grid>
                </Grid>
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
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
    sendMeetupEmails
}

export default connect(mapStateToProps, mapDispatchToProps)(Meetup)