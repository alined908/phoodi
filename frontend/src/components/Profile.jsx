import React, {Component} from 'react'
import {getProfile} from '../actions/index'
import {connect} from 'react-redux'
import {Typography, Button, Paper} from '@material-ui/core'
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

    async componentDidMount(){
        const [profile, friends] = await Promise.all([
            axios.get(`http://localhost:8000/api/users/${this.props.match.params.id}/`), 
            axios.get(
                `http://localhost:8000/api/users/${this.props.match.params.id}/friends/`, {headers: {
                    "Authorization": `JWT ${localStorage.getItem('token')}`
                }}
            )]
        )
        this.setState({user: profile.data, friends: friends.data, userLoaded: true})
        console.log(this.state.user)
    }

    renderProfile = () => {
        return (
            <Paper elevation={3} className="profile">
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
            <Paper elevation={3} className="profile-friends">

            </Paper>

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