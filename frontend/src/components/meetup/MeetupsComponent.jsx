import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getMeetups} from "../../actions/meetup";
import MeetupCard from "./MeetupCard"
import {Button, Typography, Grid} from '@material-ui/core'
import {Link} from 'react-router-dom'
import moment from "moment"

class MeetupsComponent extends Component {
    componentDidMount(){
        this.props.getMeetups();
    }

    divideMeetups = (meetups) => {
        var [past, today, week, later] = [[], [], [], []]
        for (var i = 0; i < meetups.length; i++){
            let meetup = meetups[i];
            console.log(moment(meetup.date, 'YYYY-MM-DD'));
            console.log(moment())
            console.log(moment().add(1, 'days'))
            if (moment(meetup.date, 'YYYY-MM-DD').isSame(moment(), 'day')){
                today.push(meetup)
            } else if (moment(meetup.date, 'YYYY-MM-DD').isBetween(moment().add(1, 'days'), moment().add(7, 'days'), 'days', '[]')) {
                week.push(meetup)
            } else if (moment(meetup.date, 'YYYY-MM-DD').isBetween(moment().add(7, 'days'), moment().add(30, 'days'), 'days', '[]')) {
                later.push(meetup)
            } else if (moment(meetup.date, 'YYYY-MM-DD').isBefore(moment())){
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
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <div className="inner-header">
                            <Typography variant="h5">Meetups</Typography>
                            {this.props.isMeetupsInitialized && <Link to="/meetups/new"><Button variant="contained" color="primary">Create Meetup</Button></Link>}
                        </div>
                    </Grid>
                    <div className="meetups-container">
                        {past.length > 0 && <div className="meetups-range">
                            <div className="inner-header">
                                <Typography variant="h5">Past</Typography>
                            </div>
                            <Grid container item xs={12}>
                                {past.map((meetup) => 
                                    <Grid item xs={6}>
                                        <MeetupCard key={meetup.id} meetup={meetup}/>
                                    </Grid>
                                )}
                            </Grid>
                        </div>}
                        {today.length > 0 &&  <div className="meetups-range">
                            <div className="inner-header">
                                <Typography variant="h5">Today - {moment().format("dddd, MMMM Do")}</Typography>
                            </div>
                            <Grid container item xs={12}>
                                {
                                today.map((meetup) => 
                                    <Grid item xs={6}>
                                        <MeetupCard key={meetup.id} meetup={meetup}/>
                                    </Grid>
                                )}
                            </Grid>
                        </div>}
                        {week.length > 0  && <div className="meetups-range">
                            <div className="inner-header">
                                <Typography variant="h5">This Week - {moment().add(1, 'days').format("dddd, MMMM Do")} - {moment().add(7, 'days').format("dddd, MMMM Do")}</Typography>
                            </div>
                        
                            <Grid container item xs={12}>
                                {week.map((meetup) => 

                                    <Grid item xs={6}>
                                        <MeetupCard key={meetup.id} meetup={meetup}/>
                                    </Grid>
                                )}
                            </Grid>
                        </div>}
                        {later.length > 0  && <div className="meetups-range">
                                <div className="inner-header">
                                    <Typography variant="h5">This Month - {moment().add(8, 'days').format("dddd, MMMM Do")} - {moment().add(30, 'days').format("dddd, MMMM Do")}</Typography>
                                </div>
                                <Grid container xs={12}>
                                    {later.map((meetup) => 
                                        <Grid item xs={6}>
                                            <MeetupCard key={meetup.id} meetup={meetup}/>
                                        </Grid>
                                    )}
                                </Grid>
                        </div>}
                    </div>
                </Grid>
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