import React, {Component} from 'react'
import {Paper, Button} from "@material-ui/core"
import {connect} from 'react-redux'
import {deleteMeetupEvent} from "../../actions/meetup"
import Restauraunt from "./Restauraunt"
import moment from "moment"
import WebSocketInstance from "../../accounts/WebSocket"
import CloseIcon from '@material-ui/icons/Close';
import CachedIcon from "@material-ui/icons/Cached";

class MeetupEvent extends Component {
    handleDelete = () => {
        this.props.deleteMeetupEvent(this.props.uri, this.props.event.id)
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

    render () {
        const event = this.props.event

        const renderInformation = () => {
            return (
                <div className="mt-e-info">
                    <div className="title">{event.title}</div>
                    <div>{event.location}</div>
                    <div>Start - {moment(event.start).local().format("MMM DD h:mm A")}</div>
                    <div>End - {moment(event.end).local().format("MMM DD h:mm A")}</div>
                    <div>
                        Categories: 
                        {Object.keys(event.entries).map((entry) => <span>{entry}</span>)}
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
                    <Button variant="contained" size="small">
                        Decide 
                    </Button>
                    <Button variant="contained" size="small">
                        Random  
                    </Button>
                    <CachedIcon onClick={() => this.handleReload()}/>
                    <CloseIcon onClick={() => this.handleDelete()}/>
                </div>
            )
        }

        return (
            <Paper elevation={3} className="meetup-event">
                {renderInformation()}
                {!this.props.chosen && renderFourSquare(event.options)}
                {this.props.chosen && <div>{JSON.stringify(event.options[this.props.chosen])}</div>}
                {renderActions()}
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