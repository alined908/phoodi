import React, {Component} from 'react'
import {getFriends, addFriend, deleteFriend} from "../../actions/friend"
import {sendFriendInvite, respondFriendInvite, getUserFriendInvites} from "../../actions/invite"
import {reduxForm, Field} from 'redux-form';
import {connect} from 'react-redux'
import {Button} from '@material-ui/core';
import {compose} from 'redux'
import FriendInvite from './FriendInvite'

class FriendsComponent extends Component{

    componentDidMount(){    
        this.props.getUserFriendInvites();
        this.props.getFriends();
    }

    onSubmit = (formProps) => {
        this.props.sendFriendInvite(formProps)
    }

    render(){
        const {handleSubmit} = this.props;

        const sendFriendRequestForm = () => {
            return (<form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                <div>{this.props.errorMessage}</div>
                <Field name="email" component="input" label="email"/>
                <Button type="submit" variant="contained" color="primary">Send Friend Request</Button>
            </form>)
        }

        return (
            <div>
                Friend Invites
                {!this.props.isFriendInvitesInitialized && <div>...Initializing Friend Invites</div>}
                {this.props.isFriendInvitesInitialized && this.props.invites.map((inv) => 
                    <FriendInvite inv={inv}></FriendInvite>
                )}
                {!this.props.isFriendsInitialized && <div>...Initializing Friends</div>}
                {this.props.isFriendsInitialized && <div>Friends</div>}
                {this.props.isFriendsInitialized && this.props.friends.map((friendship) => 
                    <div>{friendship.user.email}</div>
                )}
                {this.props.isFriendsInitialized && sendFriendRequestForm()}
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        friends: state.user.friends,
        isFriendsInitialized: state.user.isFriendsInitialized,
        errorMessage: state.user.errorMessage,
        invites: state.user.invites.friends,
        isFriendInvitesInitialized: state.user.isFriendInvitesInitialized
    }
}

const mapDispatchToProps = {
    getFriends,
    addFriend,
    deleteFriend,
    getUserFriendInvites,
    sendFriendInvite,
    respondFriendInvite,
}

export default compose(connect(mapStateToProps, mapDispatchToProps), reduxForm({form: 'friend'}))(FriendsComponent)