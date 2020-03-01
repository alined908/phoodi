import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getMeetups} from "../../actions/meetup";
import MeetupCard from "./MeetupCard"
import {Button, Typography, Grid} from '@material-ui/core'
import {Link} from 'react-router-dom'
import moment from "moment"
import { TodayOutlined } from '@material-ui/icons';

class MeetupsComponent extends Component {
    componentDidMount(){
        this.props.getMeetups();
    }

    divideMeetups = (meetups) => {
        var [past, today, week, later] = [[], [], [], []]
        for (var i = 0; i < meetups.length; i++){
            let meetup = meetups[i];
            if (moment(meetup.datetime).isSame(moment(), 'day')){
                today.push(meetup)
            } else if (moment(meetup.datetime).isBetween(moment().add(1, 'days'), moment().add(7, 'days'))) {
                week.push(meetup)
            } else if (moment(meetup.datetime).isBetween(moment().add(7, 'days'), moment().add(7, 'days'))) {
                later.push(meetup)
            } else if (moment(meetup.datetime).isBefore(moment())){
                past.push(meetup)
            }
        }
        return {past, today, week, later}
    }

    render(){
        const {past, today, week, later} = this.divideMeetups(this.props.meetups)

        return (
            <div className="inner-wrap">
                {!this.props.isMeetupsInitialized && <div>Initializing Meetups ....</div>}
                <div className="inner-header">
                    <Typography variant="h5">Meetups</Typography>
                    {this.props.isMeetupsInitialized && <Link to="/meetups/new"><Button variant="contained" color="primary">Create Meetup</Button></Link>}
                </div>
                {past.length > 0 && 
                    <div>
                        <div className="meetup-cards">
                            <Typography variant="h3">Past</Typography>
                            <Grid container spacing={3}>
                                {past.map((meetup) => 
                                    <Grid item xs={4}>
                                        <MeetupCard key={meetup.id} meetup={meetup}/>
                                    </Grid>
                                )}
                            </Grid>
                        </div>
                    </div>
                }
                {today.length > 0 &&
                <div>
                    <div className="meetup-cards">
                        <Typography variant="h3">Today</Typography>
                        <Grid container spacing={3}>
                        {today.map((meetup) => 
                            <Grid item xs={4}>
                                <MeetupCard key={meetup.id} meetup={meetup}/>
                            </Grid>
                        )}
                        </Grid>
                    </div>
                </div>
                }
                {week.length > 0  && 
                    <div>
                        <div className="meetup-cards">
                            <Typography variant="h3">Week</Typography>
                            <Grid container spacing={3}>
                                {week.map((meetup) => 
                                    <Grid item xs={4}>
                                        <MeetupCard key={meetup.id} meetup={meetup}/>
                                    </Grid>
                                )}
                            </Grid>
                        </div>
                    </div>
                }
                {later.length > 0 && <div>
                    <div className="meetup-cards">
                        <Typography variant="h3">Later</Typography>
                        <Grid container spacing={3}>
                        {later.map((meetup) => 
                            <Grid item xs={4}>
                                <MeetupCard key={meetup.id} meetup={meetup}/>
                            </Grid>
                        )}
                        </Grid>
                    </div>
                </div> }
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