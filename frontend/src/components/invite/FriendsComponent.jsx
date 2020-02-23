import React, {Component} from 'react'
import {getFriends, addFriend, deleteFriend} from "../../actions/friend"
import {connect} from 'react-redux'
import {Button, Typography, Paper} from '@material-ui/core';
import moment from "moment"

class FriendsComponent extends Component{

    componentDidMount(){    
        this.props.getFriends();
    }

    render(){
        return (
            <div className="inner-wrap">   
                {!this.props.isFriendsInitialized && <div>...Initializing Friends</div>}
                {this.props.isFriendsInitialized && <Typography variant="h5">
                                    Friends
                                </Typography>}
                <div className="friends">
                    {this.props.isFriendsInitialized && this.props.friends.map((friendship) => 
                        <Paper className="paper friend" elevation={3} variant="outlined">
                            {friendship.user.first_name} {friendship.user.email} {moment(friendship.created_at).local().format("MMM DD")}
                        </Paper>
                    )}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        friends: state.user.friends,
        isFriendsInitialized: state.user.isFriendsInitialized,
        invites: state.user.invites.friends,
        isFriendInvitesInitialized: state.user.isFriendInvitesInitialized
    }
}

const mapDispatchToProps = {
    getFriends,
    addFriend,
    deleteFriend,
}

export default connect(mapStateToProps, mapDispatchToProps)(FriendsComponent)