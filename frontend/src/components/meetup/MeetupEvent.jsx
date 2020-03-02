import React, {Component} from 'react'
import {Paper, Button} from "@material-ui/core"
import {connect} from 'react-redux'
import {deleteMeetupEvent} from "../../actions/meetup"
import Restauraunt from "./Restauraunt"
import moment from "moment"
import CloseIcon from '@material-ui/icons/Close';
import CachedIcon from "@material-ui/icons/Cached";
import EditIcon from '@material-ui/icons/Edit';
import {IconButton, Typography, Grid} from '@material-ui/core'
import Chip from '@material-ui/core/Chip';
import {compose} from 'redux';
import Map from "./Map"
import ScheduleIcon from '@material-ui/icons/Schedule';
import RoomIcon from '@material-ui/icons/Room';

class MeetupEvent extends Component {

    handleEdit = () => {
        console.log("handle edit function called")
    }

    handleDelete = () => {
        if (window.confirm("Are you sure you want to delete")){
            this.props.socket.deleteMeetupEvent({uri: this.props.uri, event: this.props.event.id})
        }
    }

    handleReload = () => {
        this.props.socket.reloadMeetupEvent({meetup: this.props.uri, event: this.props.event.id})
    }

    handleDecide = () => {
        this.props.socket.decideMeetupEvent({meetup: this.props.uri, event: this.props.event.id, random: false})
    }

    handleRandom = () => {
        this.props.socket.decideMeetupEvent({meetup: this.props.uri, event: this.props.event.id, random: true})
    }

    handleRedecide = () => {
        this.props.socket.redecideMeetupEvent({meetup: this.props.uri, event:this.props.event.id})
    }

    render () {
        const event = this.props.event

        const renderHeader = (number) => {
            return (
                <div className="meetup-event-header">
                    <div className="inner-header smaller-header">
                        <Typography variant="h5">#{number+1} - {event.title}</Typography>
                        <div className="inner-header-middle">
                            <div className="inner-header-icons"><ScheduleIcon/> {moment(event.start).local().format("h:mm A")} - {moment(event.end).local().format("h:mm A")}</div>
                            <div className="inner-header-icons"><RoomIcon/>{event.location}</div>
                        </div>
                        <div>
                            {renderActions()}
                        </div>
                    </div>
                </div>
            )
        }

        const renderFourSquare = (options) => {
            const keys = Object.keys(options)
            
            return (
                <div className="foursquare">
                    <Grid container spacing={3}>
                    {keys.map((key) => 
                        <Grid item xs={6}>
                            <Restauraunt socket={this.props.socket} key={key} full={true} event={this.props.event.id} meetup={this.props.uri} data={options[key]}/>
                        </Grid>
                    )}
                    </Grid>
                </div>
            )
        }

        const renderActions = () => {
            return (
                <div className="mte-actions">
                    <IconButton color="inherit"><EditIcon></EditIcon></IconButton>
                    {!this.props.chosen && <IconButton color="inherit" edge="start"><CachedIcon fontSize='large' onClick={() => this.handleReload()}/></IconButton>}
                    <IconButton color="inherit" edge="start"><CloseIcon fontSize='large' onClick={() => this.handleDelete()}/></IconButton>
                </div>
            )
        }

        const renderFinalizeActions = () => {
            return (
                <div className="mte-factions">
                    {!this.props.chosen && <Button className="button" size="small" variant="contained" color="primary" onClick={() => this.handleDecide()}>Decide</Button>}
                    {!this.props.chosen && <Button className="button" size="small" variant="contained" color="primary"onClick={() => this.handleRandom()}>Random</Button>}
                    {this.props.chosen && <Button className="button" size="small" variant="contained" color="primary" onClick={() => this.handleRedecide()}>Redecide</Button>}
                </div>
            )
        }

        const renderChosen = (chosen) => {
            const option = JSON.parse(chosen.option)
            const position = [option.coordinates.latitude, option.coordinates.longitude]

            return (
                <div className="chosen">
                    <Restauraunt socket={this.props.socket} key={chosen.id} full={false} event={this.props.event.id} meetup={this.props.uri} data={chosen}></Restauraunt>
                    <div className="map-wrapper"><Map location={position}/></div>
                </div>
            )
        }

        return (
            <div className="meetup-event">
                {renderHeader(this.props.number)}
                <div className="second-header smaller-header">
                    <div className="second-header-left"><Typography variant="h6">Categories: </Typography>
                    {Object.keys(event.entries).map((entry) => 
                        <span className="category-chip">{entry}</span>
                    )}
                    </div>
                    {renderFinalizeActions()}
                </div>
                {!this.props.chosen && renderFourSquare(event.options)}
                {this.props.chosen && renderChosen(event.options[this.props.chosen])}
                
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {
        chosen: state.meetup.meetups[props.uri].events[props.event.id].chosen
    }
}

const mapDispatchToProps = {
    deleteMeetupEvent
}

export default compose(
    connect(mapStateToProps, mapDispatchToProps), 
  )(MeetupEvent)