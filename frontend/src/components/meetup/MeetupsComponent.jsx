import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getMeetups} from "../../actions/meetup";
import {MeetupCard, CategoryAutocomplete, MeetupForm} from "../components"
import {Grid, Grow, Tooltip, IconButton, Avatar,  CircularProgress} from '@material-ui/core'
import {Link} from 'react-router-dom'
import moment from "moment"
import {Public as PublicIcon, Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Error as ErrorIcon, People as PeopleIcon} from '@material-ui/icons'
import {getPreferences} from "../../actions/index"
import PropTypes from "prop-types"
import { userPropType, preferencePropType, meetupPropType} from '../../constants/prop-types';
import {Helmet} from "react-helmet";
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import { DateRangePicker, isInclusivelyAfterDay } from "react-dates";

class MeetupsComponent extends Component {
    constructor(props){
        super(props)
        this.state = {
            focusedInput: null,
            startDate: moment(),
            endDate: moment().add('7', 'd'),
            public: true,
            newMeetupForm: false,
            entries: [],
            preferences: [],
            clickedPreferences: []
        }
    }
    
    async componentDidMount(){
        await Promise.all([
            //this.props.getMeetups(),
            this.props.getMeetups({
                type: "public",
                startDate: this.state.startDate.format("YYYY-MM-DD"),
                endDate: this.state.endDate.format("YYYY-MM-DD"),
                categories: this.formatCategories([]), 
                coords: {
                    ...this.props.user.settings
                }
            }),
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
        let publicBool = this.state.public;
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
            this.props.getMeetups({
                type: "public", 
                startDate: this.state.startDate.format("YYYY-MM-DD"),
                endDate: this.state.endDate.format("YYYY-MM-DD"),
                categories: this.formatCategories(this.state.entries),
                coords: {
                    ...this.props.user.settings
                }
            }) : 
            this.props.getMeetups({
                type: "private",
                startDate: this.state.startDate.format("YYYY-MM-DD"),
                endDate: this.state.endDate.format("YYYY-MM-DD"),
                categories: this.formatCategories(this.state.entries)
            })
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
        this.setState(
            {
                clickedPreferences: clickedPrefs,
                entries: entries
            }, () => this.state.public ? 
                this.props.getMeetups({
                    type: "public", 
                    startDate: this.state.startDate.format("YYYY-MM-DD"),
                    endDate: this.state.endDate.format("YYYY-MM-DD"),
                    categories: this.formatCategories(entries), 
                    coords: {
                        ...this.props.user.settings
                    }
                }) : 
                this.props.getMeetups({
                    type: "private", 
                    startDate: this.state.startDate.format("YYYY-MM-DD"),
                    endDate: this.state.endDate.format("YYYY-MM-DD"),
                    categories: this.formatCategories(entries)
                })
        )
    }

    openFormModal = () => {
        this.setState({newMeetupForm: !this.state.newMeetupForm})
    }

    formatCategories = entries => {
        var ids = []
        for (var category in entries){
            ids.push(entries[category].id)
        }
        let categoriesString = ids.join(",")

        return categoriesString.length > 0 ? categoriesString : null
    }
    
    onDatesChange = ({startDate, endDate}) => {
        if(!startDate || !endDate) return;
        if(!startDate.isValid() || !endDate.isValid()) return;
        console.log(startDate)
        console.log(endDate)
        this.setState({
            startDate, 
            endDate
        }, () => this.state.public ? 
            this.props.getMeetups({
                type: "public", 
                startDate: this.state.startDate.format("YYYY-MM-DD"),
                endDate: this.state.endDate.format("YYYY-MM-DD"),
                categories: this.formatCategories(this.state.entries), 
                coords: {
                    ...this.props.user.settings
                }
            }) : 
            this.props.getMeetups({
                type: "private", 
                startDate: this.state.startDate.format("YYYY-MM-DD"),
                endDate: this.state.endDate.format("YYYY-MM-DD"),
                categories: this.formatCategories(this.state.entries)
            })
        )
    }

    onFocusChange = (focusedInput) => {
        this.setState({focusedInput})
    }

    isOutsideRange = day => {
        return !isInclusivelyAfterDay(day, moment()) || day.isAfter(moment().add('30', 'd'))
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
        const meetups = this.props.meetups
        
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
                            <DateRangePicker 
                                onDatesChange={this.onDatesChange}
                                onFocusChange={this.onFocusChange}
                                focusedInput={this.state.focusedInput}
                                startDate={this.state.startDate}
                                startDateId="unique_start_date_id"
                                endDate={this.state.endDate}
                                endDateId="unique_end_date_id"
                                keepOpenOnDateSelect
                                minimumNights={0}
                                daySize={50}
                                isOutsideRange={this.state.public ? this.isOutsideRange : () => false}
                                openDirection="up"
                                noBorder
                                showDefaultInputIcon
                                displayFormat="MMM DD"
                                small
                            />
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
                    
                        <Tooltip title="Add Meetup">
                            <IconButton onClick={this.openFormModal} style={{color: "black"}}>
                                <AddIcon/>
                            </IconButton>
                        </Tooltip>
                        <MeetupForm type="create" handleClose={this.openFormModal} open={this.state.newMeetupForm}/>
                    </div>
                    
                    <div className="meetups-container" style={{minHeight: this.props.isMeetupsFetching ? "calc(100% - 60px)" : "0"}}>
                        {this.props.isMeetupsFetching && <div className="loading" style={{height: "auto"}}><CircularProgress/></div>}
                        {(!this.props.isMeetupsFetching && this.props.isMeetupsInitialized) && 
                            <Grid container spacing={1}>
                                {meetups.map((meetup, i) => 
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
    getPreferences: PropTypes.func.isRequired,
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