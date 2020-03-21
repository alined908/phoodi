import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getMeetups} from "../../actions/meetup";
import {MeetupCard, CategoryAutocomplete} from "../components"
import {Button, Grid, ButtonGroup, Grow, Tooltip, IconButton} from '@material-ui/core'
import {Link} from 'react-router-dom'
import moment from "moment"
import { Lock as LockIcon, Public as PublicIcon, ArrowBack as ArrowBackIcon, Add as AddIcon, Search as SearchIcon, Edit as EditIcon} from '@material-ui/icons'
import {getPreferences} from "../../actions/index"

class MeetupsComponent extends Component {
    constructor(props){
        super(props)
        this.state = {
            chosen: [false, true, true, true],
            entries: [],
            filters: {"private": true, "public": false},
            collapse: {"categories": false},
            preferences: [],
            clickedPreferences: []
        }
    }

    async componentDidMount(){
        await Promise.all[
            this.props.getMeetups(),
            this.props.getPreferences(this.props.user.id)
        ]
    }

    componentDidUpdate(){
        if (this.props.preferences !== this.state.preferences){
            this.setState({
                preferences: this.props.preferences,
            })
        }
    }

    handleFilter = (type) => {
        const chosen = [...this.state.chosen]
        chosen[type] = !chosen[type] 
        this.setState({chosen})
    }

    handlePreferenceClick = (index) => {
        var category = this.state.preferences[index].category
        const clickedPrefs = [...this.state.clickedPreferences]
        var entries;
        if (!clickedPrefs[index]){
            entries = [...this.state.entries, category]
        } else {
            entries = this.state.entries.filter(entry => entry!==category)
        }
        clickedPrefs[index] = !clickedPrefs[index]

        this.setState({
            clickedPreferences: clickedPrefs,
            entries: entries
        })
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

    onTagsChange = (event, values) => {
        this.setState({entries: values})
    }

    render(){
        const meetups = this.divideMeetups(this.props.meetups)

        const renderPreset = () => {
            return (
                <div className="preset">
                    {this.state.preferences.map((pref, index) => 
                        <div className={"preset-category " + (this.state.clickedPreferences[index] ? "active" : "")} onClick={() => this.handlePreferenceClick(index)}>
                            <span>{pref.category.label}</span>
                        </div>
                    )}
                </div>
            )
        }

        return (
            <div className="meetups-component">
                <div className="meetups-categories">
                    <div className="meetups-categories-inner elevate">
                        <div className="meetups-categories-top">
                            <div>Preferences</div>
                            <div>
                                <Link to={{pathname: `/profile/${this.props.user.id}`, state: {locked: false}}}>
                                    <Tooltip title="Edit Preferences">
                                        <IconButton style={{color: "black"}} edge="end">
                                            <EditIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </Link>
                                {/* <Tooltip title="Collapse">
                                    <IconButton color={this.state.collapse["categories"] ?  "primary": "default"}>
                                        <ArrowBackIcon/>
                                    </IconButton>
                                </Tooltip> */}
                            </div>
                        </div>
                        {renderPreset()}
                        <div className="search">
                            <ButtonGroup color="primary" size="small">
                                <Button variant={this.state.chosen[0] ? "contained" : "outlined"} onClick={() => this.handleFilter(0)}>Past</Button>
                                <Button variant={this.state.chosen[1] ? "contained" : "outlined"} onClick={() => this.handleFilter(1)}>Today</Button>
                                <Button variant={this.state.chosen[2] ? "contained" : "outlined"} onClick={() => this.handleFilter(2)}>Week</Button>
                                <Button variant={this.state.chosen[3] ? "contained" : "outlined"} onClick={() => this.handleFilter(3)}>Later</Button>
                            </ButtonGroup>
                        </div>
                    </div>
                </div>
                <div className="meetups-inner-wrap">
                    <div className="meetups-inner-header elevate">
                            <div>
                                Meetups
                                <Tooltip title="Public Meetups">
                                        <IconButton color={this.state.filters["public"] ? "default" : "primary"} edge="end">
                                            <PublicIcon/>
                                        </IconButton>
                                </Tooltip>
                                <Tooltip title="Private Meetups">
                                    <IconButton color={this.state.filters["private"] ? "default" : "primary"}>
                                        <LockIcon/>
                                    </IconButton>
                                </Tooltip>
                            </div>   
                            <div className="meetups-search-bar">
                                <SearchIcon/>
                                <CategoryAutocomplete fullWidth={true} size="small" entries={this.state.entries} handleClick={this.onTagsChange} label="Search Categories..."/>
                            </div>
                            <Link to="/meetups/new">
                                <Tooltip title="Add Meetup">
                                    <IconButton style={{color: "black"}}>
                                        <AddIcon/>
                                    </IconButton>
                                </Tooltip>
                            </Link>
                    </div>
                    {!this.props.isMeetupsInitialized && <div>Initializing Meetups ....</div>}
                    {this.props.isMeetupsInitialized && 
                        <div className="meetups-container">
                            <Grid container spacing={1}>
                                {[0,1, 2, 3].map((index) =>
                                    {return (this.state.chosen[index] && meetups[index].length > 0) && 
                                        <React.Fragment key={index}>
                                            {meetups[index].map((meetup, i) => 
                                                <Grid key={meetup.id} item xs={12} sm={6} lg={4}>
                                                    <Grow in={true} timeout={Math.max((index + 1) * 200, 500)}>
                                                        <div className="meetups-cardwrapper">
                                                            <MeetupCard key={meetup.id} meetup={meetup}/>
                                                        </div>
                                                    </Grow>
                                                </Grid>
                                            )}
                                        </React.Fragment>
                                    }
                                )}
                            </Grid>
                        </div>
                    }
                </div>
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        isMeetupsInitialized: state.meetup.isMeetupsInitialized,
        meetups: Object.values(state.meetup.meetups),
        preferences: state.user.preferences,
        user: state.user.user
    }
}

const mapDispatchToProps = {
    getMeetups,
    getPreferences
}

export default connect(mapStateToProps, mapDispatchToProps)(MeetupsComponent);