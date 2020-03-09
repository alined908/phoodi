import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getMeetups} from "../../actions/meetup";
import MeetupCard from "./MeetupCard"
import {Button, Typography, Grid, ButtonGroup} from '@material-ui/core'
import {Link} from 'react-router-dom'
import moment from "moment"


class MeetupsComponent extends Component {
    constructor(props){
        super(props)
        this.state = {
            chosen: [false, true, true, true]
        }
    }

    handleFilter = (type) => {
        const chosen = [...this.state.chosen]
        chosen[type] = !chosen[type] 
        this.setState({chosen})
    }

    componentDidMount(){
        this.props.getMeetups();
    }

    divideMeetups = (meetups) => {
        var [past, today, week, later] = [[], [], [], []]

        for (var i = 0; i < meetups.length; i++){
            let meetup = meetups[i];
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
        return [past, today, week, later]
    }

    render(){
        const meetups = this.divideMeetups(this.props.meetups)

        return (
            <div className="inner-wrap">
                {!this.props.isMeetupsInitialized && <div>Initializing Meetups ....</div>}
                {this.props.isMeetupsInitialized && 
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <div className="inner-header">
                                <Typography variant="h5">Meetups</Typography>
                                <ButtonGroup color="primary">
                                    <Button variant={this.state.chosen[0] ? "contained" : "outlined"} onClick={() => this.handleFilter(0)}>Past</Button>
                                    <Button variant={this.state.chosen[1] ? "contained" : "outlined"} onClick={() => this.handleFilter(1)}>Today</Button>
                                    <Button variant={this.state.chosen[2] ? "contained" : "outlined"} onClick={() => this.handleFilter(2)}>Week</Button>
                                    <Button variant={this.state.chosen[3] ? "contained" : "outlined"} onClick={() => this.handleFilter(3)}>Later</Button>
                                </ButtonGroup>
                                <Link to="/meetups/new"><Button variant="contained" color="primary">Create Meetup</Button></Link>
                            </div>
                        </Grid>
                        <div className="meetups-container">
                            <Grid container xs={12} spacing={1}>
                                {[0,1, 2, 3].map((index) =>
                                    {return (this.state.chosen[index] && meetups[index].length > 0) && <>
                                        {meetups[index].map((meetup) => 
                                            <Grid item xs={4}>
                                                <div className="meetups-cardwrapper">
                                                    <MeetupCard key={meetup.id} meetup={meetup}/>
                                                </div>
                                            </Grid>
                                        )}
                                        </>
                                })}
                            </Grid>
                        </div>
                    </Grid>
                }
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