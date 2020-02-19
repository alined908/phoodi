import React, {Component} from 'react'
import {Paper, Button} from "@material-ui/core"
import {connect} from 'react-redux'
import {deleteMeetupEvent} from "../../actions/meetup"
import Restauraunt from "./Restauraunt"
import moment from "moment"
import WebSocketInstance from "../../accounts/WebSocket"
import CloseIcon from '@material-ui/icons/Close';
import CachedIcon from "@material-ui/icons/Cached";
import EditIcon from '@material-ui/icons/Edit';

class MeetupEvent extends Component {
    handleDelete = () => {
        if (window.confirm("Are you sure you want to delete")){
            this.props.deleteMeetupEvent(this.props.uri, this.props.event.id)
        }
    }

    handleReload = () => {
        WebSocketInstance.reloadMeetupEvent({meetup: this.props.uri, event: this.props.event.id})
    }

    handleDecide = () => {
        WebSocketInstance.decideMeetupEvent({meetup: this.props.uri, event: this.props.event.id, random: false})
    }

    handleRandom = () => {
        WebSocketInstance.decideMeetupEvent({meetup: this.props.uri, event: this.props.event.id, random: true})
    }

    handleEdit = () => {
        console.log("handle edit function called")
    }

    render () {
        const event = this.props.event

        const renderHeader = () => {
            return (
                <div className="mte-header">
                    <div className="mte-info">
                        <div className="title">{event.title}</div>
                        <div>{event.location}</div>
                        <div>Start - {moment(event.start).local().format("MMM DD h:mm A")}</div>
                        <div>End - {moment(event.end).local().format("MMM DD h:mm A")}</div>
                        <div>
                            Categories: 
                            {Object.keys(event.entries).map((entry) => <span>{entry}</span>)}
                        </div>
                    </div>
                    <div className="mte-actions">
                        {renderActions()}
                    </div>
                </div>
            )
        }

        const renderFourSquare = (options) => {
            const keys = Object.keys(options)
            
            return (
                <div className="foursquare">
                    {keys.map((key) => 
                        <Restauraunt event={this.props.event.id} meetup={this.props.uri} data={options[key]}/>
                    )}
                </div>
            )
        }

        const renderActions = () => {
            return (
                <div>
                    <EditIcon onClick={() => this.handleEdit()}></EditIcon>
                    <CachedIcon fontSize='large' onClick={() => this.handleReload()}/>
                    <CloseIcon fontSize='large' onClick={() => this.handleDelete()}/>
                </div>
            )
        }

        const renderFinalizeActions = () => {
            return (
                <div className="mte-factions">
                    <Button className="button" variant="contained" onClick={() => this.handleDecide()}>
                        Decide 
                    </Button>
                    <Button className="button" variant="contained"onClick={() => this.handleRandom()}>
                        Random  
                    </Button>
                </div>
            )
        }

        const renderChosen = (chosen) => {
            return <div>{chosen.id}</div>
        }

        return (
            <Paper elevation={3} className="meetup-event">
                {renderHeader()}
                {!this.props.chosen && renderFourSquare(event.options)}
                {this.props.chosen && renderChosen(event.options[this.props.chosen])}
                {renderFinalizeActions()}
            </Paper>
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

export default connect(mapStateToProps, mapDispatchToProps)(MeetupEvent)