import React, {Component} from 'react'
import {getFriends, deleteFriend} from "../../actions/friend"
import {sendFriendInvite} from "../../actions/invite"
import {connect} from 'react-redux'
import {compose} from 'redux'
import {reduxForm, Field} from 'redux-form';
import {Button, Typography, Paper, Grid} from '@material-ui/core';
import {removeNotifs} from "../../actions/notifications"
import renderTextField from "../renderTextField"
import moment from "moment"
import {Link} from 'react-router-dom'

class FriendsComponent extends Component{

    componentDidMount(){    
        this.props.getFriends(this.props.user.id);
        if (this.props.notifs !== null && this.props.notifs > 0){
            console.log(this.props.notifs)
            console.log("hello")
            this.props.removeNotifs({type: "friend"})
        }
    }

    onSubmit = (formProps) => {
        this.props.sendFriendInvite(formProps)
    }

    render(){
        const sendFriendRequestForm = () => {
            return (
                <form className="horizontal-form" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                    <div>{this.props.errorMessage}</div>
                    <Field name="email" component={renderTextField} {...{size:"small"}} label="Email"/>
                    <Button size="small" type="submit" variant="contained" color="primary">Send</Button>
                </form>
            )
        }

        const {handleSubmit} = this.props;

        return (
            <div className="inner-wrap">   
                {!this.props.isFriendsInitialized && <div>...Initializing Friends</div>}
                {this.props.isFriendsInitialized && 
                    <div className="inner-header">
                        <Typography variant="h5">Friends</Typography>
                        {sendFriendRequestForm()}
                    </div>
                }
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
        notifs: state.notifs.friend
    }
}

const mapDispatchToProps = {
    getFriends,
    deleteFriend,
    removeNotifs,
    sendFriendInvite
}

export default compose(connect(mapStateToProps, mapDispatchToProps), reduxForm({form: 'friend'}))(FriendsComponent)