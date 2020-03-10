import React, {Component} from 'react'
import {Button} from "@material-ui/core"
import {connect} from 'react-redux'
import {deleteMeetupEvent} from "../../actions/meetup"
import Restauraunt from "./Restauraunt"
import moment from "moment"
import CachedIcon from "@material-ui/icons/Cached";
import EditIcon from '@material-ui/icons/Edit';
import {IconButton, Typography, Grid} from '@material-ui/core'
import {compose} from 'redux';
import Map from "./Map"
import ScheduleIcon from '@material-ui/icons/Schedule';
import DeleteIcon from '@material-ui/icons/Delete';
import {Link} from 'react-router-dom'

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

    handlePriceChips = (prices) => {
        var priceList = prices.replace(/\s/g, '').split(",");
        for (var i = 0; i < priceList.length; i++){
            priceList[i] = "$".repeat(parseInt(priceList[i]))
        }
        return priceList;
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
                    <Grid justify="center" container spacing={3}>
                    {keys.map((key) => 
                        <Grid item xs={12} md={6}>
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
                    {!this.props.chosen && 
                        <IconButton onClick={() => this.handleReload()} color="primary" aria-label="reload">
                            <CachedIcon />
                        </IconButton>
                    }
                    <Link to={`/meetups/${this.props.uri}/events/${this.props.event.id}/edit`}>
                        <IconButton color="inherit" aria-label="edit">
                            <EditIcon></EditIcon>
                        </IconButton>
                    </Link>
                    <IconButton onClick={() => this.handleDelete()} color="secondary" aria-label="delete">
                        <DeleteIcon />
                    </IconButton>
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
                    <div className="second-header-left">
                        <Typography variant="h6">Categories </Typography>
                        {event.categories.map((category) => 
                            <span className="category-chip">{category.label}</span>
                        )}
                    </div>
                    <div className="second-header-left">
                        <Typography variant="h6">Price </Typography>  
                        {(this.handlePriceChips(event.price)).map((price) => 
                            <span className="category-chip">{price}</span>
                        )
                        }
                    </div>
                    <div className="second-header-left">
                        <Typography variant="h6">Distance </Typography>
                        <span className="category-chip">
                            {(Math.round(event.distance * 0.000621371192)).toFixed(2)}
                        </span>
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