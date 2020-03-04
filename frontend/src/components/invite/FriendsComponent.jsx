import React, {Component} from 'react'
import {getFriends, deleteFriend} from "../../actions/friend"
import {sendFriendInvite} from "../../actions/invite"
import {connect} from 'react-redux'
import {compose} from 'redux'
import {reduxForm, Field} from 'redux-form';
import {Button, Typography, Paper, Grid, ListItem, ListItemAvatar, Avatar, ListItemText} from '@material-ui/core';
import {removeNotifs} from "../../actions/notifications"
import renderTextField from "../renderTextField"
import Friend from "./Friend"

class FriendsComponent extends Component{

    componentDidMount(){    
        this.props.getFriends(this.props.user.id);
        if (this.props.notifs !== null && this.props.notifs > 0){
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
                {this.props.isFriendsInitialized && <div className="friends">
                    <Grid container spacing={3}>
                        {this.props.friends.map((friend) => 
                            <Grid item xs={4}>
                                <Friend isUserFriend={true} friend={friend}/>
                            </Grid>
                        )}
                    </Grid>
                </div>}
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