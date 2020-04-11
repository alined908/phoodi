import React, { Component } from 'react'
import {reduxForm, Field} from 'redux-form';
import {Button, Typography, Paper, Grid, ButtonGroup, Slider, Fab, Radio, FormControlLabel} from '@material-ui/core';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {addMeetupEvent, getMeetup, getMeetupEvents} from "../../actions/meetup"
import {renderDatePicker, renderTextField, CategoryAutocomplete} from '../components'
import {Link} from 'react-router-dom'
import {axiosClient} from "../../accounts/axiosClient"
import {history} from '../MeetupApp'
import {addGlobalMessage} from '../../actions/globalMessages'

const marks = [{value: 0.25},{value: 0.50},{value: 1},{value: 2},{value: 3},{value: 5},{value: 10},{value: 25}]
const convert = {0.25: 400, 0.50: 800, 1: 1600, 2: 3200, 3: 4800, 5: 8000, 10: 16000, 25: 40000}
const reconvert = {400: 0.25, 800: 0.50, 1600: 1, 3200: 2, 4800: 3, 8000:5, 16000: 10, 40000: 25}

const validate = values => {
    const errors = {}
    if (values.start >= values.end){
        errors.start = "Start time must be before end time "
    }

    return errors
}

const convertPricesToState = (prices) => {
    const nums = prices !== undefined ? prices.replace(/ /g,'').split(",") : "";
    var state = [false, false, false, false]
    for (var i = 0; i < nums.length; i++){
        const entry = parseInt(nums[i]) - 1
        state[entry] = true 
    }
    return state
}
 
class MeetupEventForm extends Component {
    constructor(props){
        super(props)
        this.state = {
            entries: props.entries ? props.entries : [],
            prices: props.prices ? convertPricesToState(props.prices) : [true, true , false, false],
            distance: props.distance ? reconvert[props.distance] : 10,
            random: props.random ? props.random : true,
            initialized: props.isMeetupInitialized && props.isMeetupEventsInitialized
        }
        this.onTagsChange = this.onTagsChange.bind(this)
    }

    async componentDidMount(){
        if (!this.props.isMeetupInitialized || !this.props.isMeetupEventsInitialized){
            await Promise.all(
                [   
                    this.props.getMeetup(this.props.match.params.uri), 
                    this.props.getMeetupEvents(this.props.match.params.uri)
                ]
            )
        }
    }

    static getDerivedStateFromProps(props, state){
        if (props.type === "edit" && !state.initialized && props.isMeetupEventsInitialized && props.isMeetupInitialized){
            return {
                title: props.title,
                entries: props.entries,
                prices: convertPricesToState(props.prices),
                distance: reconvert[props.distance],
                initialized: true
            }
        }
        return null;
    }

    handleEntries = () => {
        const entries = {}
        for (var i = 0; i < this.state.entries.length; i++){
            let entry = this.state.entries[i];
            entries[entry.api_label] = entry.id
        }
        return entries
    }

    onSubmit = async (formProps) => {
        const indices = this.state.prices.reduce((out, bool, index) => bool ? out.concat(index+1) : out, [])
        const prices = indices.join(", ")
        const uri = this.props.match.params.uri
        const data = {entries: this.handleEntries(), distance: convert[this.state.distance], price: prices, random: this.state.random,...formProps}
        
        if (this.props.type === "create"){
            try {
                const response = await axiosClient.post(
                    `/api/meetups/${uri}/events/`, data, {headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                }})
                history.push(`/meetups/${uri}`)
            }  catch(e){
                this.props.addGlobalMessage("error", "Something went wrong")
            }
        } 
        if (this.props.type === "edit") {
            try {
                const response = axiosClient.patch(
                    `/api/meetups/${uri}/events/${this.props.match.params.id}/`, data, {headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                }})
                history.push(`/meetups/${uri}`)
            } catch(e){
                this.props.addGlobalMessage("error", "Something went wrong")
            }
        }
    }

    handlePrice = (price) => {
        const prices = [...this.state.prices]
        prices[price-1] = !prices[price-1] 
        this.setState({prices})
    }

    handleDistance = (e, val) => {
        this.setState({distance: val})
    }

    handleRandomClick = (type) => {
        this.setState({random: type})
    }

    onTagsChange = (event, values) => {
        this.setState({entries: values})
    }

    render () {
        const create = this.props.type === "create"

        return (
            <div className="inner-wrap">
                <div className="inner-header elevate">
                    <Typography variant="h5">{create ? "Create New Event" : "Edit Event"}</Typography>
                    <Link to={`/meetups/${this.props.match.params.uri}`}><Button variant="contained" color="primary">Meetup</Button></Link>
                </div> 
                <div className="form">
                    <Paper className="form-paper elevate">
                        <form onSubmit={this.props.handleSubmit(this.onSubmit.bind(this))}>
                            <Grid container style={{padding: "1rem"}} spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="h6">Meetup Event Information</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Field required name="title" component={renderTextField} label="Event Name"></Field>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <CategoryAutocomplete form={true} label="Search Categories..." size="medium" entries={this.state.entries} handleClick={this.onTagsChange}/>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Field required name="start" component={renderDatePicker} label="Start Time"></Field>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Field name="end" component={renderDatePicker} label="End Time"></Field>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <div className="price">
                                        <Typography variant="h6">Price</Typography>
                                        <div className="price-options">
                                            <ButtonGroup color="primary">
                                                <Button variant={this.state.prices[0] ? "contained" : "outlined"} onClick={() => this.handlePrice(1)}>$</Button>
                                                <Button variant={this.state.prices[1] ? "contained" : "outlined"} onClick={() => this.handlePrice(2)}>$$</Button>
                                                <Button variant={this.state.prices[2] ? "contained" : "outlined"} onClick={() => this.handlePrice(3)}>$$$</Button>
                                                <Button variant={this.state.prices[3] ? "contained" : "outlined"} onClick={() => this.handlePrice(4)}>$$$$</Button>
                                            </ButtonGroup>
                                        </div>
                                    </div>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControlLabel label="Random" control={<Radio color="primary" checked={this.state.random} onClick={() => this.handleRandomClick(true)}/>} />
                                    <FormControlLabel label="Custom" control={<Radio color="primary" checked={!this.state.random} onClick={() => this.handleRandomClick(false)}/>}/>
                                </Grid>
                                <Grid item xs={12}>
                                    <div className="distance">
                                        <Typography variant="h6">Distance (mi)</Typography>
                                        <div className="distance-options">
                                        <Slider valueLabelDisplay="on" 
                                            step={null} marks={marks} 
                                            value={this.state.distance} min={0.25} max={25}
                                            onChange={(event, val) => this.handleDistance(event, val)}/>
                                        </div>  
                                    </div>
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Fab color="primary" variant="extended" type="submit" aria-label="add"> 
                                        {create ? "Add Event" : "Edit Event"}
                                    </Fab>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, ownProps){
    const meetup = state.meetup.meetups[ownProps.match.params.uri]
    const uri = ownProps.match.params.uri
    const id = ownProps.match.params.id

    if (ownProps.type === "edit" && (uri in state.meetup.meetups) && ("events" in meetup)){
        const event = meetup.events[id]
        return {
            initialValues: {title: event.title, start: event.start, end: event.end},
            distance: event.distance,
            prices: event.price,
            entries: event.categories,
            random: event.random,
            isMeetupInitialized: true,
            isMeetupEventsInitialized: true
        }
    }
    else {
        return {
            meetup: meetup,
            initialValues: {
                start: new Date(Math.ceil(new Date().getTime()/300000)*300000),
                end: new Date(Math.ceil(new Date().getTime()/2100000) * 2100000)
            },
            isMeetupInitialized: false,
            isMeetupEventsInitialized: false,
            entries: [],
        }
    }
}

const mapDispatchToProps = {
    addMeetupEvent,
    getMeetup,
    getMeetupEvents,
    addGlobalMessage
}

export default compose (
    connect(mapStateToProps, mapDispatchToProps),
    reduxForm({form: 'event', validate, enableReinitialize : true })
)(MeetupEventForm);