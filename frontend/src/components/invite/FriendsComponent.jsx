import React, {Component} from 'react'
import {getFriends, deleteFriend} from "../../actions/friend"
import {sendFriendInvite} from "../../actions/invite"
import {addGlobalMessage} from "../../actions/globalMessages"
import {connect} from 'react-redux'
import {Button, Typography, Grid} from '@material-ui/core';
import {removeNotifs} from "../../actions/notifications"
import {Friend, UserAutocomplete} from '../components'
import PropTypes from 'prop-types'
import { friendPropType, userPropType } from '../../constants/prop-types'
import {Helmet} from 'react-helmet'

class FriendsComponent extends Component{
    constructor(props){
        super(props)
        this.state = {
            email: ""
        }
        this.handleClick = this.handleClick.bind(this)
        this.handleType = this.handleType.bind(this)
    }

    componentDidMount(){    
        this.props.getFriends(this.props.user.id);
        if (this.props.notifs !== null && this.props.notifs > 0){
            this.props.removeNotifs({type: "friend"})
        }
    }

    handleSubmit = (e) => {
        e.preventDefault()
        if (this.props.user.email === this.state.email){
            this.props.addGlobalMessage("error", "Cannot invite yourself.")
        } else {
            this.props.sendFriendInvite({email: this.state.email})
        }
        
    }

    handleType = (e) => {
        this.setState({email: e.target.value})
    }

    handleClick = (e, value) => {
        let email;
        if (value === null){
            email = ""
        } else {
            email = value.email
        }
        this.setState({email})
    }

    render(){
        return (
            <div className="inner-wrap">
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>Friends</title>
                    <meta name="description" content="Phoodie Friends" />
                </Helmet>   
                {!this.props.isFriendsInitialized && <div>...Initializing Friends</div>}
                {this.props.isFriendsInitialized && 
                    <div className="inner-header elevate">
                        <Typography variant="h5">Friends</Typography>
                        <form className="horizontal-form" onSubmit={this.handleSubmit}>
                            <UserAutocomplete handleClick={this.handleClick} handleType={this.handleType}/>
                            <Button size="small" type="submit" variant="contained" color="primary">Send</Button>
                        </form>
                    </div>
                }
                {this.props.isFriendsInitialized && <div className="friends">
                    <Grid container spacing={3}>
                        {this.props.friends.map((friend) => 
                            <Grid key={friend.id} item xs={12} md={6} lg={4} >
                                <Friend isUserFriend={true} friend={friend}/>
                            </Grid>
                        )}
                    </Grid>
                </div>}
            </div>
        )
    }
}

FriendsComponent.propTypes = {
    user: userPropType,
    friends: PropTypes.arrayOf(friendPropType),
    isFriendsInitialized: PropTypes.bool.isRequired,
    notifs: PropTypes.number,
    getFriends: PropTypes.func.isRequired, deleteFriend: PropTypes.func.isRequired,
    removeNotifs: PropTypes.func.isRequired, sendFriendInvite: PropTypes.func.isRequired,
    addGlobalMessage: PropTypes.func.isRequired
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
    sendFriendInvite,
    addGlobalMessage
}

export default connect(mapStateToProps, mapDispatchToProps)(FriendsComponent)