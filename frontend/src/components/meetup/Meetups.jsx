import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getMeetups, getPreferences} from "../../actions";
import {MeetupCard, CategoryAutocomplete, MeetupForm} from "../components"
import {Grid, Grow, Tooltip, IconButton, Avatar,  CircularProgress, Paper} from '@material-ui/core'
import {Link} from 'react-router-dom'
import moment from "moment"
import {Public as PublicIcon, Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Error as ErrorIcon, People as PeopleIcon} from '@material-ui/icons'
import PropTypes from "prop-types"
import { userPropType, preferencePropType, meetupPropType} from '../../constants/prop-types';
import {Helmet} from "react-helmet";
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import { DateRangePicker, isInclusivelyAfterDay } from "react-dates";
import styles from '../../styles/meetup.module.css'

class Meetups extends Component {
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

    /**
     * Get public meetups or private meetups
     * @param {string} type - Public or Private
     */
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
        this.setState({public: publicBool}, () => this.determineGetMeetups(publicBool, this.state.entries))
    }


    /**
     * Filter public/private meetups by preferences.
     * @param {number} index - Index of clicked preference
     */
    handlePreferenceClick = (index) => {
        var category = this.state.preferences[index].category
        const clickedPreferences = [...this.state.clickedPreferences]
        var entries;
        if (!clickedPreferences[index]){
            entries = [...this.state.entries, category]
        } else {
            entries = this.state.entries.filter(entry => JSON.stringify(entry) !== JSON.stringify(category))
        }
        clickedPreferences[index] = !clickedPreferences[index]
        this.setState({clickedPreferences, entries}, () => this.determineGetMeetups(this.state.public, entries))
    }

    /**
     * Filter public/private meetups by date range.
     * @param {Object} - Start date - End date
     */
    onDatesChange = ({startDate, endDate}) => {
        if (!startDate || !endDate) return;
        if (!startDate.isValid() || !endDate.isValid()) return;
        this.setState({startDate, endDate}, () => this.determineGetMeetups(this.state.public, this.state.entries))
    }

    onFocusChange = (focusedInput) => {
        this.setState({focusedInput})
    }

    isOutsideRange = day => {
        return !isInclusivelyAfterDay(day, moment()) || day.isAfter(moment().add('30', 'd'))
    }

    /**
     * Filter public/private meetups by category from autocomplete.
     * @param {Array} values - Array of categories.
     */
    onTagsChange = (event, values) => {
        console.log(values)
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

        this.setState({ entries: values, clickedPreferences: clickedPrefs}, () => this.determineGetMeetups(this.state.public, values))
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

    determineGetMeetups = (isPublic, categories) => {
        if (isPublic) {
            this.props.getMeetups({
                type: "public",
                startDate: this.state.startDate.format("YYYY-MM-DD"),
                endDate: this.state.endDate.format("YYYY-MM-DD"),
                categories: this.formatCategories(categories), 
                coords: {...this.props.user.settings}
            })
        } else {
            this.props.getMeetups({
                type: "private", 
                startDate: this.state.startDate.format("YYYY-MM-DD"),
                endDate: this.state.endDate.format("YYYY-MM-DD"),
                categories: this.formatCategories(categories)
            })
        }
    }

    render(){
        const meetups = this.props.meetups
        
        const renderPreset = () => {
            return (
                <div className={styles.preset}>
                    {this.state.preferences.map((pref, index) => 
                        <div 
                            key={pref.id}
                            onClick={() => this.handlePreferenceClick(index)}
                            className={`${styles.presetCategory} ${this.state.clickedPreferences[index] ? styles.active : ""}`} 
                        >
                            <Avatar variant="square"
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
            <div className={styles.meetups}>
                <Helmet>
                    <meta charSet="utf-8" />
                    <meta name="description" content="Meetups near you!" />
                    <title>Meetups</title>
                </Helmet>
                <div className={styles.meetupsCategories}>
                    <Paper className={styles.meetupsCategoriesInner} elevation={2}>
                        <div className={styles.meetupsCategoriesTop}>
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
                    </Paper>
                </div>
                <div className={styles.meetupsInnerWrap}>
                    <Paper className={styles.meetupsInnerHeader} elevation={2}>
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
                        <div className={styles.meetupsSearchBar}>
                            <SearchIcon/>
                            <CategoryAutocomplete 
                                fullWidth={true} size="small" entries={this.state.entries} 
                                handleClick={this.onTagsChange} label="Search Categories..."
                            />
                        </div>
                        <div className={styles.categoryChip}>
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
                    </Paper>
                    
                    <div className={styles.meetupsContainer} style={{minHeight: this.props.isMeetupsFetching ? "calc(100% - 60px)" : "0"}}>
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

Meetups.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(Meetups);