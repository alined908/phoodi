import React, {Component} from "react"
import {connect} from "react-redux";
import {getMeetup} from "../../actions/meetup"
import {Meetup} from '../components';
import {Redirect} from 'react-router-dom'
import {CircularProgress} from '@material-ui/core'

class MeetupPageComponent extends Component {
    constructor(props){
        super(props)
        const uri = this.props.match.params.uri
        if (!(uri in this.props.meetups)){
            this.props.getMeetup(uri)
        }
    }

    determineIsUserMember = (members) => {
        var isUserMember = false;
        for (var key of Object.keys(members)){
            const member = members[key]
            if (member.user.id === this.props.user.id){
                return true
            }
        }
        return isUserMember
    }

    render () {
        const meetup = this.props.meetups[this.props.match.params.uri]
        const isUserMember = meetup ? this.determineIsUserMember(meetup.members) : false

        return (
            <>
                {meetup ?
                    (isUserMember ? 
                        <Meetup key={meetup.id} meetup={meetup} isUserMember={isUserMember}/> : 
                        <Redirect to="/meetups"/>
                    ) :
                    <div><CircularProgress/></div>
                }
            </>
        )
    }
}

function mapStateToProps(state) {
    return {
        meetups: state.meetup.meetups,
        user: state.user.user
    }
}

const mapDispatchToProps = {
    getMeetup
}

export default connect(mapStateToProps, mapDispatchToProps)(MeetupPageComponent)