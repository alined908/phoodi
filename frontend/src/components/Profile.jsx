import React, {Component} from 'react'
import {getProfile} from '../actions/index'
import {connect} from 'react-redux'
import {Typography, Button} from '@material-ui/core'
import {Link} from 'react-router-dom'

class Profile extends Component {
    constructor(props){
        super(props);
        this.state = {
            user: {},
            userLoaded: false
        }
    }

    async componentDidMount(){
        const profile = await getProfile(this.props.match.params.id);
        this.setState({user: profile, userLoaded: true})
    }

    profile = () =>{
        return (<div className="profile">
            {this.state.user.first_name}
            {this.state.user.last_name}
            {this.state.user.email}
            <img className="user-avatar" src={this.state.user.avatar}></img>
        </div>)     
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
                {this.state.userLoaded && this.profile()}
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