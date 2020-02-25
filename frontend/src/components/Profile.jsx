import React, {Component} from 'react'
import {getProfile} from '../actions/index'
import {connect} from 'react-redux'
import {Typography, Button, Paper, Grid} from '@material-ui/core'
import {Link} from 'react-router-dom'
import {getProfileFriends} from '../actions/friend';
import axios from 'axios'

class Profile extends Component {
    constructor(props){
        super(props);
        this.state = {
            user: {},
            friends: [],
            userLoaded: false
        }
    }

    componentDidMount(){
        this.getInformation()
    }

    componentDidUpdate(prevProps){
        if (this.props.match.params.id !== prevProps.match.params.id){
            this.getInformation()
        }
    }

    getInformation = async () => {
        const [profile, friends] = await Promise.all([
            axios.get(`http://localhost:8000/api/users/${this.props.match.params.id}/`), 
            axios.get(
                `http://localhost:8000/api/users/${this.props.match.params.id}/friends/`, {headers: {
                    "Authorization": `JWT ${localStorage.getItem('token')}`
                }}
            )]
        )
        this.setState({user: profile.data, friends: friends.data, userLoaded: true})
    }

    renderProfile = () => {
        return (
            <Paper elevation={1} className="paper">
                <div className="pic"><img className="user-avatar" src={this.state.user.avatar}></img></div>
                <div>
                    <Typography variant="h4">
                        {this.state.user.first_name}
                        {this.state.user.last_name}
                    </Typography>
                    {this.state.user.email}
                </div>
            </Paper>
        )     
    }
    
    renderFriends = () => {
        return (
            <>
                <div className="inner-header">
                    <Typography variant="h5">Friends</Typography>
                </div>
                <Grid container spacing={3}>   
                    {this.state.friends.map((friend) => 
                        <Grid item xs={6}>
                            <Link to={`/profile/${friend.user.id}`}>
                                <Paper className="paper" elevation={3}>
                                    <div><img className="user-avatar-sm" src={friend.user.avatar}></img></div>
                                    <div>{friend.user.first_name} {friend.user.last_name}</div>
                                    <div>{friend.user.email}</div>
                                    <Link to="/chat/"></Link>
                                </Paper>
                            </Link>
                        </Grid>
                    )}
                </Grid>
            </>
        )
    }

    render () {
        return (
            <div className="inner-wrap">
                <div className="inner-header">
                    <Typography variant="h5">Profile</Typography>
                    {this.props.user.id.toString() === this.props.match.params.id && 
                        <Link to="/profile/edit">
                            <Button variant="contained" color="primary">Edit Profile</Button>
                        </Link>
                    }
                </div>
                {this.state.userLoaded && this.renderProfile()}
                {this.state.userLoaded && this.renderFriends()}
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user.user
    }
}

export default connect(mapStateToProps, null)(Profile)