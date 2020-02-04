import React, {Component} from 'react'
import Restauraunt from "./Restauraunt"
import {connect} from 'react-redux';
import {deleteMeetup} from '../actions/meetup';
import {getFriends} from "../actions/friend"
import Button from '@material-ui/core/Button';
import moment from 'moment';
import MeetupFriend from "./MeetupFriend"

class Meetup extends Component {
    constructor(props){
        super(props)
        if(!this.props.isFriendsInitialized){
            this.props.getFriends()
        }

    }
    
    handleDelete = (uri) => {
        this.props.deleteMeetup(uri);
    }

    render () {
        var choices = {}
        var valid = false;
        const [id, name, uri, location, datetime, options, chosen, members] = this.props.meetup
        if (options !== ""){
            choices = JSON.parse(options);
            valid = true
            console.log(choices)
        }

        const isMember = (friend) => {
            if (friend in members){
                return true
            } else {
                return false
            }
        }

        const renderFriends = () => {
            return (
                <div>
                    {this.props.isFriendsInitialized && this.props.friends.map((friendship) => <MeetupFriend friend={friendship.user} isMember={isMember(friendship.user.id)}></MeetupFriend>)}
                </div>
            )
        }
        
        return (
            <div className="meetup">
                <div>{name}</div>
                <div>{moment(datetime).local().format("MMM DD h:mm A")}</div>
                <div>{location}</div>
                <div>Members - {Object.keys(members).map((key) => members[key].email + " ")}</div>
                <Button variant="contained" color="secondary" onClick={() => this.handleDelete(uri)}>Delete Meetup</Button>
                <div className="rsts">
                    {valid && choices.businesses.map((rest) => 
                        <Restauraunt data={rest}/>
                    )}
                </div>
                <div>{renderFriends()}</div>
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
       friends: state.user.friends,
       isFriendsInitialized: state.user.isFriendsInitialized
    }
}

const mapDispatchToProps = {
    deleteMeetup,
    getFriends
}

export default connect(mapStateToProps, mapDispatchToProps)(Meetup)