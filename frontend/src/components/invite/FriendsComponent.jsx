import React, {Component} from 'react'
import {getFriends, addFriend, deleteFriend} from "../../actions/friend"
import {connect} from 'react-redux'
import {Button, Typography, Paper, Grid} from '@material-ui/core';
import moment from "moment"
import {Link} from 'react-router-dom'

class FriendsComponent extends Component{

    componentDidMount(){    
        this.props.getFriends(this.props.user.id);
    }

    render(){
        return (
            <div className="inner-wrap">   
                {!this.props.isFriendsInitialized && <div>...Initializing Friends</div>}
                {this.props.isFriendsInitialized && <Typography variant="h5">Friends</Typography>}
                <div className="friends">
                    <Grid container spacing={3}>
                        {this.props.isFriendsInitialized && this.props.friends.map((friend) => 
                            <Grid item xs={4}>
                                <Link to={`/profile/${friend.user.id}`}>
                                    <Paper className="paper friend" elevation={3} variant="outlined">
                                        <div><img className="user-avatar-sm" src={friend.user.avatar}></img></div>
                                        {friend.user.first_name} 
                                        {friend.user.email} 
                                        {moment(friend.created_at).local().format("MMM DD")}
                                        <Link to={`/chat/${friend.chat_room}`}><Button variant="contained" color="primary">Chat</Button></Link>
                                    </Paper>
                                </Link>
                            </Grid>
                        )}
                    </Grid>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        user: state.user.user,
        friends: state.user.friends,
        isFriendsInitialized: state.user.isFriendsInitialized,
    }
}

const mapDispatchToProps = {
    getFriends,
    addFriend,
    deleteFriend,
}

export default connect(mapStateToProps, mapDispatchToProps)(FriendsComponent)