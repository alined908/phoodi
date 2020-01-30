import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getMeetups} from "../actions/meetup";
import Meetup from "./Meetup"

class MainComponent extends Component {
    componentDidMount(){
        this.props.getMeetups();
    }

    render(){
        console.log(this.props)
        return (
            <div>
                {!this.props.isMeetupsInitialized && <div>Initializing Meetups ....</div>}
                {this.props.isMeetupsInitialized && this.props.meetups.map((meetup) => 
                    <Meetup key={meetup.id} meetup={Object.values(meetup)}></Meetup>
                )}
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        isMeetupsInitialized: state.meetup.isMeetupsInitialized,
        meetups: Object.values(state.meetup.meetups)
    }
}

const mapDispatchToProps = {
    getMeetups
}

export default connect(mapStateToProps, mapDispatchToProps)(MainComponent);