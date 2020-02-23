import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getMeetups} from "../../actions/meetup";
import MeetupCard from "./MeetupCard"
import {Button, Typography} from '@material-ui/core'
import {Link} from 'react-router-dom'

class MeetupsComponent extends Component {
    componentDidMount(){
        this.props.getMeetups();
    }

    render(){
        return (
            <div className="inner-wrap">
                {!this.props.isMeetupsInitialized && <div>Initializing Meetups ....</div>}
                <div className="inner-header">
                    <Typography variant="h5">Meetups</Typography>
                    {this.props.isMeetupsInitialized && <Link to="/meetups/new"><Button variant="contained" color="primary">Create Meetup</Button></Link>}
                </div>
                
                <div className="meetup-cards">
                    {this.props.isMeetupsInitialized && this.props.meetups.map((meetup) => 
                        // <Meetup key={meetup.id} meetup={Object.values(meetup)}></Meetup>
                        <MeetupCard key={meetup.id} meetup={meetup}></MeetupCard>
                    )}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        isMeetupsInitialized: state.meetup.isMeetupsInitialized,
        meetups: Object.values(state.meetup.meetups),
    }
}

const mapDispatchToProps = {
    getMeetups
}

export default connect(mapStateToProps, mapDispatchToProps)(MeetupsComponent);