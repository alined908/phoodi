import React, {Component} from 'react'
import {Button, Paper} from "@material-ui/core"
import {connect} from 'react-redux'
import {deleteMeetupEvent} from "../../actions/meetup"
import {addGlobalMessage} from "../../actions/globalMessages"
import moment from "moment"
import {Cached as CachedIcon, Edit as EditIcon, Close as CloseIcon, Search as SearchIcon, 
    Schedule as ScheduleIcon, Delete as DeleteIcon, Error as ErrorIcon} from '@material-ui/icons'
import {IconButton, Typography, Grid, Grow, Tooltip, Avatar, Divider} from '@material-ui/core'
import {compose} from 'redux';
import {MeetupEventOption, Map, RestaurauntAutocomplete, ProgressIcon, MeetupEventForm} from '../components'
import {Link} from 'react-router-dom'
import PropTypes from 'prop-types';
import {meetupEventPropType} from "../../constants/prop-types"
import styles from '../../styles/meetup.module.css'

class MeetupEvent extends Component {
    constructor(props){
        super(props)
        this.state = {
            searchOpen: false,
            searchInput: "",
            editMeetupEventForm: false
        }
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

    handleSearchOption = () => {
        this.setState({searchOpen: !this.state.searchOpen})
    }

    handleSearchValue = (e) => {
        this.setState({searchInput: e.target.value})
    }

    handleSearchValueClick = (e, value) => {
        if (value !== null){
            if (this.isRestaurantOptionAlready(value)){
                this.props.addGlobalMessage("error", "Already an option.")
            } else {
                this.props.socket.addEventOption({meetup: this.props.uri, event: this.props.event.id, option: value})
                this.props.addGlobalMessage("success", "Successfully added option")
            }
            
        }
        this.setState({searchInput: ""})
    }

    openEventModal = () => {
        this.setState({editMeetupEventForm: !this.state.editMeetupEventForm})
    }

    isRestaurantOptionAlready = (restaurant) => {
        const identifier = restaurant.id
        const options_keys = this.props.event.options

        for (let key in options_keys){
            let rst = options_keys[key].restaurant
            console.log(rst.identifier)
            if(rst.identifier === identifier){
                return true
            }
        }
        
        return false
    }

    isUserEventCreator = () => {
        return this.props.event.creator.id === this.props.user.id
    }

    render () {
        const event = this.props.event
        const isUserEventCreator = this.isUserEventCreator()
        const permission = isUserEventCreator || this.props.isUserCreator

        const renderHeader = (number) => {
            return (
                <Paper elevation={3}>
                    <div className={`${styles.header} ${styles.smallerheader}`} >
                        <Typography variant="h5">#{number+1} - {event.title}</Typography>
                        <div className={styles.headerInfo}>
                            <div className={styles.headerIcons}>
                                <ScheduleIcon/> 
                                {moment(event.start).local().format("h:mm A")} - {moment(event.end).local().format("h:mm A")}
                            </div>
                            <div className={styles.headerIcons}>
                                <img style={{width: 20, height: 20, marginLeft: 10}} alt={"&#9787;"}
                                src={`https://meetup-static.s3-us-west-1.amazonaws.com/static/general/panda.png`}/>
                                {/* <Avatar style={{transform: "scale(0.5)"}} src={event.creator.avatar}>
                                    {event.creator.first_name.charAt(0)} {event.creator.last_name.charAt(0)}
                                </Avatar> */}
                                 - {event.creator.first_name} {event.creator.last_name}
                            </div>
                        </div>
                        <div>
                            {this.props.isUserMember && renderActions()}
                        </div>
                    </div>
                </Paper>
            )
        }

        const renderFourSquare = (options) => {
            const keys = Object.keys(options).reverse()
            
            return (
                <div className={styles.foursquare}>
                    {keys.length > 0 ?
                        <Grid justify="center" container spacing={3}>
                            {keys.map((key, index) => 
                                <Grow key={key} in={true} timeout={300 * (index + 1)}>
                                    <Grid item id={`option-${key}`} justify={index % 2 === 0 ? "flex-end" : "flex-start"} container xs={12} md={6} sm={12}>
                                        <MeetupEventOption
                                            socket={this.props.socket} full={true} 
                                            isUserMember={this.props.isUserMember} event={this.props.event.id} 
                                            meetup={this.props.uri} data={options[key]}
                                        />
                                    </Grid>
                                </Grow>
                            )}
                        </Grid>:
                        <Paper className={styles.explanation} elevation={3}>
                            <span style={{marginRight: "1rem"}}>
                                <ErrorIcon style={{color: "rgb(255, 212, 96)"}}/>
                            </span>
                            {event.random ? <span>
                                No options available. 
                                This may be due to no options being available at this time or the categories specified don't have enough options.
                                Press the edit button to add more categories or change time if inputted incorrectly.
                            </span> : <span>
                                    No options chosen.  Click the top right magnifying glass to search for restauraunts near you!
                                </span>}
                        </Paper>
                    }
                </div>
            )
        }

        const renderActions = () => {
            return (
                <div className={styles.eventActions}>
                    {(!this.props.chosen) &&
                        <Tooltip title="Add Option">
                            <IconButton style={{color: "#4caf50"}} onClick={this.handleSearchOption}>
                                <SearchIcon/>
                            </IconButton>
                        </Tooltip>
                    }
                    {!this.props.chosen &&
                        (event.random &&
                            <Tooltip title="Reload">
                                <div style={{width: 48, minHeight: 48}}>
                                    <ProgressIcon 
                                        disabled={false} icon={<CachedIcon />} ariaLabel="reload" check={false}
                                        color="primary" handleClick={() => this.handleReload()} 
                                    />
                                </div>
                            </Tooltip>
                        )
                    }
                    
                    <Tooltip title="Edit">
                        <IconButton onClick={this.openEventModal} color="inherit" aria-label="edit">
                            <EditIcon/>
                        </IconButton>
                    </Tooltip>
                    {this.state.editMeetupEventForm && 
                        <MeetupEventForm 
                            type="edit" event={event.id} uri={this.props.uri} handleClose={this.openEventModal}
                            open={this.state.editMeetupEventForm}
                        />
                    }
                    {permission && <Tooltip title="Delete">
                        <IconButton onClick={() => this.handleDelete()} color="secondary" aria-label="delete">
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>}
                </div>
            )
        }

        const renderFinalizeActions = () => {
            return (
                <div className={styles.eventDecideActions}>
                    {(!this.props.chosen && Object.keys(event.options).length > 0) && 
                        <Button 
                            className="button" size="small" variant="contained" 
                            color="primary" onClick={() => this.handleDecide()}
                        >
                            Decide
                        </Button>
                    }
                    {(!this.props.chosen && Object.keys(event.options).length > 0) && 
                        <Button 
                            className="button" size="small" variant="contained" 
                            color="primary" onClick={() => this.handleRandom()}
                        >
                                Random
                        </Button>}
                    {this.props.chosen && 
                        <Button 
                            className="button" size="small" variant="contained" 
                            color="primary" onClick={() => this.handleRedecide()}
                        >
                            Redecide
                        </Button>
                    }
                </div>
            )
        }

        const renderChosen = (chosen) => {
            const option = chosen.restaurant
            const position = {latitude: option.latitude, longitude: option.longitude}

            return (
                <div className={styles.chosen}>
                    <Paper className={styles.chosenRestaurant} elevation={3}>
                        <MeetupEventOption 
                            key={chosen.id} socket={this.props.socket} 
                            isUserMember={this.props.isUserMember} full={false} 
                            event={this.props.event.id} meetup={this.props.uri} data={chosen}
                        />
                    </Paper>
                    <Paper className={styles.chosenMap} elevation={3}>
                        <div className={styles.mapWrapper}>
                            <Map location={position}/>
                        </div>
                    </Paper>
                </div>
            )
        }

        return (
            <div id={`event-${event.id}`} className={styles.event}>
                {renderHeader(this.props.number)}
                <Paper className={`${styles.smallerHeader} ${styles.secondHeader}`} elevation={3}>
                    <div className={styles.secondHeaderLeft}>
                        <Typography variant="h6">Categories </Typography>
                        {event.categories.map((category) => 
                            <Link key={category.id} to={`/category/${category.api_label}`}>
                                <span className={`${styles.categoryChip} ${styles.categoryChipHover}`}>
                                    <Avatar style={{width: 20, height: 20}} src={`${process.env.REACT_APP_S3_STATIC_URL}${category.api_label}.png`} variant="square"/>
                                    {category.label}
                                </span>
                            </Link>
                        )}
                    </div>
                    <div className={styles.secondHeaderLeft}>
                        <Typography variant="h6">Price </Typography>  
                        {(this.handlePriceChips(event.price)).map((price, index) => 
                            <span key={index} className={styles.categoryChip}>{price}</span>
                        )
                        }
                    </div>
                    <div className={styles.secondHeaderLeft}>
                        <Typography variant="h6">Distance </Typography>
                        <span className={styles.categoryChip}>
                            {(Math.round(event.distance * 0.000621371192)).toFixed(2)}
                        </span>
                    </div>
                    {this.props.isUserMember && renderFinalizeActions()}
                </Paper>
                {!this.props.chosen && 
                    <>
                        {this.state.searchOpen &&
                            <Paper className={styles.addOptionSearch} elevation={3}>
                                <img style={{width: 20, height: 20, marginLeft: 10}} alt={"&#9787;"}
                                src={`https://meetup-static.s3-us-west-1.amazonaws.com/static/general/panda.png`}/>
                                <RestaurauntAutocomplete 
                                    coords={this.props.coords} 
                                    radius={event.distance} 
                                    label="Type a restauraunt name or category..."
                                    textValue={this.state.searchInput}
                                    handleSearchValueClick={this.handleSearchValueClick}
                                />
                                <Divider className="divider" orientation="vertical" />
                                <Tooltip title="Close">
                                    <IconButton color="secondary" onClick={this.handleSearchOption}>
                                        <CloseIcon/>
                                    </IconButton>
                                </Tooltip>
                            </Paper>
                        }                       
                    </>
                }
                {!this.props.chosen && renderFourSquare(event.options)}
                {this.props.chosen && renderChosen(event.options[this.props.chosen])}
                
            </div>
        )
    }
}

MeetupEvent.propTypes = {
    number: PropTypes.number.isRequired,
    socket: PropTypes.object.isRequired,
    uri: PropTypes.string.isRequired,
    isUserMember: PropTypes.bool.isRequired,
    coords: PropTypes.shape({
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired
    }),
    event: meetupEventPropType,
    chosen: PropTypes.number,
    settings: PropTypes.object.isRequired,
    deleteMeetupEvent: PropTypes.func.isRequired,
    addGlobalMessage: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
    return {
        chosen: state.meetup.meetups[props.uri].events[props.event.id].chosen,
        settings: state.user.user.settings
    }
}

const mapDispatchToProps = {
    deleteMeetupEvent,
    addGlobalMessage
}

export default compose(
    connect(mapStateToProps, mapDispatchToProps), 
  )(MeetupEvent)