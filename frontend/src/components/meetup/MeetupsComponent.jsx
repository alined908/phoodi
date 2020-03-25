import React, {Component} from 'react';
import {connect} from 'react-redux';
import {getMeetups, getPublicMeetups} from "../../actions/meetup";
import {MeetupCard, CategoryAutocomplete} from "../components"
import {Grid, Grow, Tooltip, IconButton, FormGroup, FormControlLabel, Checkbox} from '@material-ui/core'
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
            public: true,
            collapse: {categories: false},
            preferences: [],
            clickedPreferences: []
        }
    }

    async componentDidMount(){
        await Promise.all[
            //this.props.getMeetups(),
            this.props.getPublicMeetups({categories: []}),
            this.props.getPreferences(this.props.user.id)
        ]
        this.getUserLocation()
    }

    componentDidUpdate(){
        if (this.props.preferences !== this.state.preferences){
            this.setState({
                preferences: this.props.preferences,
            })
        }
    }

    getUserLocation = () => {
        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge:1000
        }

        const onSuccess = (position) => {
            console.log(position)
        }
        
        const onError = (error) => {
            console.warn(error.message)
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError, options)
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
            this.props.getPublicMeetups({categories: this.state.entries}) : 
            this.props.getMeetups({categories: this.state.entries})
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
        }, () => this.props.getPublicMeetups({categories: entries}))
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
            () => this.props.getPublicMeetups({categories: values})
        )

    }

    render(){
        const meetups = this.divideMeetups(this.props.meetups)

        const renderPreset = () => {
            return (
                <div className="preset">
                    {this.state.preferences.map((pref, index) => 
                        <div className={"preset-category " + (this.state.clickedPreferences[index] ? "active" : "")} onClick={() => this.handlePreferenceClick(index)}>
                            <img src={`${process.env.REACT_APP_S3_STATIC_URL}${pref.category.api_label}.png`}></img>
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
                            <FormGroup row>
                                <FormControlLabel label="Past" control={<Checkbox color="primary" size="small" checked={this.state.chosen[0]} onChange={() => this.handleFilter(0)}/>}/>
                                <FormControlLabel label="Today" control={<Checkbox color="primary" size="small" checked={this.state.chosen[1]} onChange={() => this.handleFilter(1)}/>}/>
                                <FormControlLabel label="Week" control={<Checkbox color="primary" size="small" checked={this.state.chosen[2]} onChange={() => this.handleFilter(2)}/>}/>
                                <FormControlLabel label="Later" control={<Checkbox color="primary" size="small" checked={this.state.chosen[3]} onChange={() => this.handleFilter(3)}/>}/>
                            </FormGroup>
                        </div>
                    </div>
                </div>
                <div className="meetups-inner-wrap">
                    <div className="meetups-inner-header elevate">
                            <div>
                                Meetups
                                <Tooltip title="Public Meetups">
                                        <IconButton onClick={() => this.handleMeetupsType("public")} color={this.state.public ? "primary" :"default"} edge="end">
                                            <PublicIcon/>
                                        </IconButton>
                                </Tooltip>
                                <Tooltip title="Private Meetups">
                                    <IconButton onClick={() => this.handleMeetupsType("private")} color={this.state.public ? "default" : "primary"}>
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
                    {/* {!this.props.isMeetupsInitialized && <div>Initializing Meetups ....</div>} */}
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
    getPreferences,
    getPublicMeetups
}

export default connect(mapStateToProps, mapDispatchToProps)(MeetupsComponent);