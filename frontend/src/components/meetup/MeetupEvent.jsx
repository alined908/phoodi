import React, {Component} from 'react'
import {Paper, Button} from "@material-ui/core"
import {connect} from 'react-redux'
import {deleteMeetupEvent} from "../../actions/meetup"
import Carousel from "../carousel/Carousel"
import moment from "moment"

class MeetupEvent extends Component {
    handleDelete = () => {
        this.props.deleteMeetupEvent(this.props.uri, this.props.event.id)
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
                </div>
            )
        }

        const renderCarousel = (options) => {
            return <Carousel options={options}></Carousel>
        }

        const renderActions = () => {
            return (
                <div>
                    <Button variant="contained" size="small">
                        Reload Restauraunts
                    </Button>
                    <Button onClick={() => this.handleDelete()} variant="contained" size="small" color="secondary"> 
                        Delete Event
                    </Button>
                </div>
            )
        }

        return (
            <Paper elevation={3} className="meetup-event">
                {renderInformation()}
                {renderCarousel(event.options)}
                {renderActions()}
            </Paper>
        )
    }
}

const mapDispatchToProps = {
    deleteMeetupEvent
}


export default connect(null, mapDispatchToProps)(MeetupEvent)