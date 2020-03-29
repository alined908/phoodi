import React, {Component} from 'react'
import {Button} from "@material-ui/core"
import {connect} from 'react-redux'
import {deleteMeetupEvent} from "../../actions/meetup"
import moment from "moment"
import {Cached as CachedIcon, Edit as EditIcon, Schedule as ScheduleIcon, Delete as DeleteIcon, Error as ErrorIcon} from '@material-ui/icons'
import {IconButton, Typography, Grid, Grow, Tooltip, Avatar} from '@material-ui/core'
import {compose} from 'redux';
import {Restauraunt, Map} from '../components'
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
                <div className="meetup-event-header elevate">
                    <div className="inner-header smaller-header">
                        <Typography variant="h5">#{number+1} - {event.title}</Typography>
                        <div className="inner-header-middle">
                            <div className="inner-header-icons"><ScheduleIcon/> {moment(event.start).local().format("h:mm A")} - {moment(event.end).local().format("h:mm A")}</div>
                        </div>
                        <div>
                            {this.props.isUserMember && renderActions()}
                        </div>
                    </div>
                </div>
            )
        }

        const renderFourSquare = (options) => {
            const keys = Object.keys(options)
            
            return (
                <div className="foursquare">
                    {keys.length > 1 ?
                        <Grid justify="center" container spacing={3}>
                            {keys.map((key, index) => 
                                <Grow in={true} timeout={300 * (index + 1)}>
                                    <Grid item justify={index % 2 === 0 ? "flex-end" : "flex-start"} container xs={12} md={6} sm={12}>
                                        <Restauraunt socket={this.props.socket} key={key} full={true} isUserMember={this.props.isUserMember} event={this.props.event.id} meetup={this.props.uri} data={options[key]}/>
                                    </Grid>
                                </Grow>
                            )}
                        </Grid>:
                        <div className="explanation elevate">
                            <span style={{marginRight: "1rem"}}><ErrorIcon style={{color: "rgb(255, 212, 96)"}}/></span>
                            <span>No options available. 
                            This may be due to no options being available at this time or the categories specified don't have enough options.
                            Press the edit button to add more categories or change time if inputted incorrectly.</span>
                        </div>
                    }
                </div>
            )
        }

        const renderActions = () => {
            return (
                <div className="mte-actions">
                    {!this.props.chosen && 
                        <Tooltip title="Reload">
                            <IconButton onClick={() => this.handleReload()} color="primary" aria-label="reload">
                                <CachedIcon />
                            </IconButton>
                        </Tooltip>
                    }
                    <Link to={`/meetups/${this.props.uri}/events/${this.props.event.id}/edit`}>
                        <Tooltip title="Edit">
                            <IconButton color="inherit" aria-label="edit">
                                <EditIcon></EditIcon>
                            </IconButton>
                        </Tooltip>
                    </Link>
                    <Tooltip title="Delete">
                        <IconButton onClick={() => this.handleDelete()} color="secondary" aria-label="delete">
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            )
        }

        const renderFinalizeActions = () => {
            return (
                <div className="mte-factions">
                    {!this.props.chosen && <Button className="button rainbow" size="small" variant="contained" color="primary" onClick={() => this.handleDecide()}>Decide</Button>}
                    {!this.props.chosen && <Button className="button rainbow" size="small" variant="contained" color="primary" onClick={() => this.handleRandom()}>Random</Button>}
                    {this.props.chosen && <Button className="button rainbow" size="small" variant="contained" color="primary" onClick={() => this.handleRedecide()}>Redecide</Button>}
                </div>
            )
        }

        const renderChosen = (chosen) => {
            const option = JSON.parse(chosen.option)
            const position = [option.coordinates.latitude, option.coordinates.longitude]

            return (
                <div className="chosen">
                    <div className="chosen-restauraunt elevate">
                        <Restauraunt socket={this.props.socket} isUserMember={this.props.isUserMember} key={chosen.id} full={false} event={this.props.event.id} meetup={this.props.uri} data={chosen}></Restauraunt>
                    </div>
                    <div className="chosen-map elevate2">
                        <div className="map-wrapper">
                            <Map location={position}/>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="meetup-event">
                {renderHeader(this.props.number)}
                <div className="second-header smaller-header elevate">
                    <div className="second-header-left">
                        <Typography variant="h6">Categories </Typography>
                        {event.categories.map((category) => 
                            <Link to={`/category/${category.api_label}`}>
                                <span className="category-chip elevate category-chip-hover">
                                    <Avatar style={{width: 20, height: 20}} src={`${process.env.REACT_APP_S3_STATIC_URL}${category.api_label}.png`} variant="square"/>
                                    {category.label}
                                </span>
                            </Link>
                        )}
                    </div>
                    <div className="second-header-left">
                        <Typography variant="h6">Price </Typography>  
                        {(this.handlePriceChips(event.price)).map((price) => 
                            <span className="category-chip elevate">{price}</span>
                        )
                        }
                    </div>
                    <div className="second-header-left">
                        <Typography variant="h6">Distance </Typography>
                        <span className="category-chip elevate">
                            {(Math.round(event.distance * 0.000621371192)).toFixed(2)}
                        </span>
                    </div>
                    {this.props.isUserMember && renderFinalizeActions()}
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