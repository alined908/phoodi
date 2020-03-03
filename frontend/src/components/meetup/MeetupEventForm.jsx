import React, { Component } from 'react'
import {reduxForm, Field} from 'redux-form';
import renderDatePicker from "./renderDatePicker"
import {Button, Typography, Paper, Grid, ButtonGroup, Slider, Fab} from '@material-ui/core';
import renderTextField from '../renderTextField'
import {compose} from 'redux';
import {connect} from 'react-redux';
import {addMeetupEvent} from "../../actions/meetup"
import {Link} from 'react-router-dom'
import axios from "axios"
import Category from "./Category"
import {history} from '../MeetupApp'

const marks = [{value: 0.25},{value: 0.50},{value: 1},{value: 2},{value: 3},{value: 5},{value: 10},{value: 25}]
const convert = {0.25: 400, 0.50: 800, 1: 1600, 2: 3200, 3: 4800, 5: 8000, 10: 16000, 25: 40000}

class MeetupEventForm extends Component {
    constructor(props){
        super(props)
        this.state = {
            categories: [],
            entries: {},
            prices: [true, true , false, false],
            distance: 10
        }
    }

    componentDidMount(){
        if (localStorage.getItem("categories") === null) {
            axios.get("http://localhost:8000/api/categories/")
            .then((response) =>
                localStorage.setItem("categories", JSON.stringify(response.data)
            ))
        } 
        
        this.setState({
            categories: JSON.parse(localStorage.getItem('categories')).categories
        })
    }

    onSubmit = (formProps) => {
        const indices = this.state.prices.reduce((out, bool, index) => bool ? out.concat(index+1) : out, [])
        const prices = indices.join(", ")
        const uri = this.props.match.params.uri
        const data = {uri: uri, entries: this.state.entries, distance: convert[this.state.distance], prices: prices, ...formProps}
        axios.post(
            `http://localhost:8000/api/meetups/${uri}/events/`, data, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        history.push(`/meetups/${uri}`)
    }

    handlePrice = (price) => {
        const prices = [...this.state.prices]
        prices[price-1] = !prices[price-1] 
        this.setState({prices})
    }

    handleCategory = (api_label, id) => {
        var entries = this.state.entries
        if (api_label in entries) {
            delete entries[api_label]
        } else {
            entries[api_label] = id
        }
        this.setState({
            entries: entries
        })
    }

    handleDistance = (e, val) => {
        this.setState({distance: val})
    }

    render () {
        const {handleSubmit} = this.props;
        var date = this.props.meetup.date.split("-")
        const maxDate = new Date(date[0], date[1] + 1, date[2])

        return (
            <div className="inner-wrap">
                <div className="inner-header">
                    <Typography variant="h5">Create New Event</Typography>
                    <Link to={`/meetups/${this.props.match.params.uri}`}><Button variant="contained" color="primary">Meetup</Button></Link>
                </div> 
                <div className="form">
                    <Paper elevation={3} style={{padding: "2rem 3rem"}}>
                        <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                            <Grid container style={{padding: "1rem"}} spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="h6">Meetup Event Information</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Field required name="title" component={renderTextField} label="Event Name"></Field>
                                </Grid>
                
                                <Grid item xs={6}>
                                    <Field required name="start" component={renderDatePicker} label="Start" {...{maxDate: maxDate}}></Field>
                                </Grid>
                                <Grid item xs={6}>
                                    <Field name="end" component={renderDatePicker} label="End"></Field>
                                </Grid>
                                <Grid item xs={6}>
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
                                <Grid item xs={6}>
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
                                    <Typography variant="h6">Categories</Typography>
                                    <div className="categories">
                                        {this.state.categories.map((category) => 
                                            <div className="category" onClick={() => this.handleCategory(category.api_label, category.id)}>
                                                <Category key={category.id} category={category}></Category>
                                            </div>
                                        )}
                                    </div>
                                </Grid>
                                <Grid item xs={12}>
                                    <Fab color="primary" variant="extended" type="submit" aria-label="add" >Add Event</Fab>
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
    return {
        meetup: state.meetup.meetups[ownProps.match.params.uri]
    }
}


const mapDispatchToProps = {
    addMeetupEvent,
}

export default compose (
    connect(mapStateToProps, mapDispatchToProps),
    reduxForm({form: 'event'})
)(MeetupEventForm);