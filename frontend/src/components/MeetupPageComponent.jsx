import React, {Component} from "react"
import {connect} from "react-redux";
import {getMeetup} from "../actions/meetup"
import Meetup from "./Meetup";

class MeetupPageComponent extends Component {
    constructor(props){
        super(props)
        const uri = this.props.match.params.uri
        if (!(uri in this.props.meetups)){
            this.props.getMeetup(uri)
        }
    }

    render () {
        const meetup = this.props.meetups[this.props.match.params.uri]
        console.log(meetup)
        
        return (
            <div>
                {meetup && <Meetup key={meetup.id} meetup={Object.values(meetup)}></Meetup>}
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        meetups: state.meetup.meetups
    }
}

const mapDispatchToProps = {
    getMeetup
}

export default connect(mapStateToProps, mapDispatchToProps)(MeetupPageComponent)