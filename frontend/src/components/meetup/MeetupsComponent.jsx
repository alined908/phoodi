import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getMeetups} from "../../actions/meetup";
import {MeetupCard, CategoryAutocomplete} from "../components"
import {Grid, Grow, Tooltip, IconButton, FormGroup, FormControlLabel, Checkbox, Avatar,  CircularProgress} from '@material-ui/core'
import {Link} from 'react-router-dom'
import moment from "moment"
import {Public as PublicIcon, Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Error as ErrorIcon, People as PeopleIcon} from '@material-ui/icons'
import {getPreferences} from "../../actions/index"
import PropTypes from "prop-types"
import { userPropType, preferencePropType, meetupPropType} from '../../constants/prop-types';
import {Helmet} from "react-helmet";

class MeetupsComponent extends Component {
    constructor(props){
        super(props)
        this.state = {
            chosen: [false, true, true, true],
            entries: [],
            public: true,
            preferences: [],
            clickedPreferences: [],
        }
    }
    
    async componentDidMount(){
        await Promise.all([
            //this.props.getMeetups(),
            this.props.getMeetups({type: "public", categories: this.formatCategories([]), coords: {...this.props.user.settings}}) ,
            this.props.getPreferences(this.props.user.id)
        ])
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

    handleMeetupsType = (type) => {
        var publicBool = this.state.public;
        if (type === "public") {
            if (!publicBool){
                publicBool = true
            }
        } else if (type === "private"){
            if (publicBool){
                publicBool = false
            }
        }
        this.setState({public: publicBool}, () => publicBool ? 
            this.props.getMeetups({type: "public", categories: this.formatCategories(this.state.entries), coords: {...this.props.user.settings}}) : 
            this.props.getMeetups({type: "private", categories: this.formatCategories(this.state.entries)})
        )
    }

    handlePreferenceClick = (index) => {
        var category = this.state.preferences[index].category
        const clickedPrefs = [...this.state.clickedPreferences]
        var entries;
        if (!clickedPrefs[index]){
            entries = [...this.state.entries, category]
        } else {
            entries = this.state.entries.filter(entry => JSON.stringify(entry) !== JSON.stringify(category))
        }
        clickedPrefs[index] = !clickedPrefs[index]
        this.setState({
            clickedPreferences: clickedPrefs,
            entries: entries
        }, () => this.state.public ? 
            this.props.getMeetups({type: "public", categories: this.formatCategories(entries), coords: {...this.props.user.settings}}) : 
            this.props.getMeetups({type: "private", categories: this.formatCategories(entries)}))
    }

    formatCategories = entries => {
        var ids = []
        for (var category in entries){
            ids.push(entries[category].id)
        }
        return ids.join(",")
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
        const dividedMeetups = [past, today, week, later]
        var filteredMeetups = []
        dividedMeetups.forEach((range, i) => {
            if (this.state.chosen[i]){
                filteredMeetups = filteredMeetups.concat(range)
            }
        })
        return filteredMeetups
    }

    onTagsChange = (event, values) => {
        var clickedPrefs = [...this.state.clickedPreferences]
  
        for(var i = 0; i < clickedPrefs.length; i ++){
            if (clickedPrefs[i]){
                let pref = this.state.preferences[i]
                let category = pref.category
                if (!values.includes(category)){
                    clickedPrefs[i] = !clickedPrefs[i]
                }
            }
        }

        for(var j = 0; j < values.length; j++){
            let category = values[j];

            for(var z=0; z < this.state.preferences.length; z++){
                let preference = this.state.preferences[z];
                if (JSON.stringify(preference.category) === JSON.stringify(category) && clickedPrefs[z] !== true){
                    clickedPrefs[z] = true
                }
            }
        }

        this.setState(
            {
                entries: values,
                clickedPreferences: clickedPrefs
            },
            () => this.state.public ? 
                this.props.getMeetups({type: "public", categories: this.formatCategories(values), coords: {...this.props.user.settings}}) : 
                this.props.getMeetups({type: "private", categories: this.formatCategories(values)})
        )

    }

    render(){
        const filteredMeetups = this.divideMeetups(this.props.meetups)

        const renderPreset = () => {
            return (
                <div className="preset">
                    {this.state.preferences.map((pref, index) => 
                        <div 
                            key={pref.id} className={"preset-category " + (this.state.clickedPreferences[index] ? "active" : "")} 
                            onClick={() => this.handlePreferenceClick(index)}
                        >
                            <Avatar varaint="square"
                                src={`${process.env.REACT_APP_S3_STATIC_URL}${pref.category.api_label}.png`}
                            />
                            <span>{pref.category.label}</span>
                        </div>
                    )}
                    {this.state.preferences.length === 0 && 
                        <div className="no-entity"> 
                            <ErrorIcon style={{color: "rgb(255, 212, 96)"}}/> 
                        <span className="no-entity-text">No preferences! Add some by pressing the top right pencil.</span>
                    </div>
                    }
                </div>
            )
        }

        return (
            <div className="meetups-component">
                <Helmet>
                    <meta charSet="utf-8" />
                    <meta name="description" content="Meetups near you!" />
                    <title>Meetups</title>
                </Helmet>
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
                            </div>
                        </div>
                        {renderPreset()}
                        <div className="search">
                            <FormGroup row>
                                <FormControlLabel 
                                    label="Past" control={<Checkbox color="primary" size="small" 
                                    checked={this.state.chosen[0]} onChange={() => this.handleFilter(0)}/>}
                                />
                                <FormControlLabel 
                                    label="Today" control={<Checkbox color="primary" size="small" 
                                    checked={this.state.chosen[1]} onChange={() => this.handleFilter(1)}/>}
                                />
                                <FormControlLabel 
                                    label="Week" control={<Checkbox color="primary" size="small" 
                                    checked={this.state.chosen[2]} onChange={() => this.handleFilter(2)}/>}
                                />
                                <FormControlLabel 
                                    label="Later" control={<Checkbox color="primary" size="small" 
                                    checked={this.state.chosen[3]} onChange={() => this.handleFilter(3)}/>}
                                />
                            </FormGroup>
                        </div>
                    </div>
                </div>
                <div className="meetups-inner-wrap">
                    <div className="meetups-inner-header elevate">
                        <div>
                            Meetups
                            <Tooltip title="Public Meetups">
                                    <IconButton 
                                        onClick={() => this.handleMeetupsType("public")} 
                                        color={this.state.public ? "primary" :"default"} edge="end"
                                    >
                                        <PublicIcon/>
                                    </IconButton>
                            </Tooltip>
                            <Tooltip title="Your Meetups">
                                <IconButton 
                                    onClick={() => this.handleMeetupsType("private")} 
                                    color={this.state.public ? "default" : "primary"}
                                >
                                    <PeopleIcon/>
                                </IconButton>
                            </Tooltip>
                        </div>   
                        <div className="meetups-search-bar">
                            <SearchIcon/>
                            <CategoryAutocomplete 
                                fullWidth={true} size="small" entries={this.state.entries} 
                                handleClick={this.onTagsChange} label="Search Categories..."
                            />
                        </div>
                        <div className="category-chip">
                            {this.state.public ? 
                                <>{this.props.user.settings ? this.props.user.settings.radius : "25"} miles</> :
                                <>X miles</>
                            }
                        </div>
                        
                        <Link to="/meetups/new">
                            <Tooltip title="Add Meetup">
                                <IconButton style={{color: "black"}}>
                                    <AddIcon/>
                                </IconButton>
                            </Tooltip>
                        </Link>
                    </div>
                    {/* {!this.props.isMeetupsInitialized && <div>Initializing Meetups ....</div>} */} 
                    
                    
                    <div className="meetups-container" style={{minHeight: this.props.isMeetupsFetching ? "calc(100% - 60px)" : "0"}}>
                        {this.props.isMeetupsFetching && <div className="loading" style={{height: "auto"}}><CircularProgress/></div>}
                        {(!this.props.isMeetupsFetching && this.props.isMeetupsInitialized) && 
                            <Grid container spacing={1}>
                                {filteredMeetups.map((meetup, i) => 
                                    <Grid key={meetup.id} item xs={12} lg={6} xl={4}>
                                        <Grow in={true} timeout={Math.max((i + 1) * 50, 500)}>
                                            <div className="meetups-cardwrapper">
                                                <MeetupCard key={meetup.id} meetup={meetup}/>
                                            </div>
                                        </Grow>
                                    </Grid>
                                )}
                            </Grid>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

MeetupsComponent.propTypes = {
    isMeetupsInitialized: PropTypes.bool.isRequired,
    meetups: PropTypes.arrayOf(meetupPropType).isRequired,
    user: userPropType,
    preferences: PropTypes.arrayOf(preferencePropType).isRequired,
    getMeetups: PropTypes.func.isRequired,
    getPreferences: PropTypes.func.isRequired, getPublicMeetups: PropTypes.func.isRequired,
    isMeetupsFetching: PropTypes.bool.isRequired
}

function mapStateToProps(state){
    return {
        user: state.user.user,
        meetups: Object.values(state.meetup.meetups),
        preferences: state.user.preferences,
        isMeetupsInitialized: state.meetup.isMeetupsInitialized,
        isMeetupsFetching: state.meetup.isMeetupsFetching
    }
}

const mapDispatchToProps = {
    getMeetups,
    getPreferences
}

export default connect(mapStateToProps, mapDispatchToProps)(MeetupsComponent);