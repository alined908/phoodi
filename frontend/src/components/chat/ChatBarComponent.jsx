import React, {Component} from 'react';
import {ContactComponent} from "../components";
import {connect} from 'react-redux';
import {IconButton, Tooltip, CircularProgress} from '@material-ui/core'
import {Event as EventIcon, Person as PersonIcon, Search as SearchIcon, Error as ErrorIcon} from '@material-ui/icons';
import PropTypes from 'prop-types';
import {chatRoomPropType, userPropType,} from "../../constants/prop-types"
import WebSocketService from "../../accounts/WebSocket"
import AuthenticationService from '../../accounts/AuthenticationService';
import {updateRoom} from '../../actions/chat'

class ChatBarComponent extends Component {
    constructor(props){
        super(props)
        this.state = {
            rooms: [],
            filteredRooms: [],
            searchedRooms: [],
            liveRooms: [],
            filters: {
                "friend": false, 
                "meetup": false
            },
            isFiltered: false,
            isSearched: false,
            searchInput: '',
            socket: new WebSocketService()
        }
        this.state.socket.addContactsCallbacks(this.props.updateRoom)
    }

    componentDidMount(){
        const socket = this.state.socket
        const token = AuthenticationService.retrieveToken()
        const path = `/ws/chat/rooms/`;
        socket.connect(path, token);
    }

    componentDidUpdate(prevProps) {
        if (this.props.rooms !== prevProps.rooms) {
            this.setState({rooms: this.props.rooms, liveRooms: this.props.rooms})
        }
    }

    filterAndSearch = () => {
        var rooms = this.state.rooms
        var filter = this.state.searchInput
        var filterMeetup = this.state.filters["meetup"]
        var filterFriend = this.state.filters["friend"]
        var newRooms;

        newRooms = rooms.filter((room) => {
        
            let meetupCriteria = false;
            if (room.meetup !== null) {
                meetupCriteria = room.name.toLowerCase().includes(filter.toLowerCase()) && !filterMeetup
            }

            let friendCriteria = false;
            if (room.friendship !== null){
                const user = this.props.user
                let friend;
                for (var key in room.members){
                    if (key !== user.id.toString()){
                        friend = room.members[key]
                    }
                }
                const friendName = friend.first_name + " " + friend.last_name

                friendCriteria = ((friendName.toLowerCase().includes(filter.toLowerCase())) || (friend.email.toLowerCase().includes(filter.toLowerCase()))) && !filterFriend
            }

            return meetupCriteria || friendCriteria
        })

        this.setState({liveRooms: newRooms})
    }

    filterRooms = (type) => {
        var filters = {...this.state.filters}
        filters[type] = !filters[type]
        this.setState({filters}, () => this.filterAndSearch())
    }

    handleSearchInputChange = (e) => {
        var filter = e.target.value;
        this.setState({searchInput: filter}, () => this.filterAndSearch())
    }

    render (){
        const rooms = this.state.liveRooms

        return (
            <div className="chat-bar elevate">
                <div className="chat-bar-top">
                    <div>Contacts</div>
                    <div>
                        <Tooltip title="Friends">
                            <IconButton color={this.state.filters["friend"] ? "default" : "primary"} onClick={() => this.filterRooms("friend")} edge="end">
                                <PersonIcon/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Meetups">
                            <IconButton color={this.state.filters["meetup"] ? "default" : "primary"} onClick={() => this.filterRooms("meetup")}>
                                <EventIcon/>
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
                <div className="chat-bar-contacts">
                    {!this.props.isRoomsInitialized && <div className="loading"><CircularProgress/></div>}
                    {(this.props.isRoomsInitialized && rooms.length === 0) && 
                        <div className="no-entity">
                            <ErrorIcon style={{color: "rgb(255, 212, 96)"}}/>
                            <span className="no-entity-text">No chat rooms match criteria!</span>
                        </div>
                    }
                    {this.props.isRoomsInitialized && rooms.map((room) => 
                        <ContactComponent user={this.props.user} key={room.id} room={room}/>
                    )}
                </div>
                <div className="chat-bar-search">
                    <SearchIcon/>
                    <input className="chat-input" type="text" placeholder="Search Contacts..." value={this.state.searchInput} onChange={this.handleSearchInputChange}></input>
                </div>
            </div>
        )
    }
}

ChatBarComponent.propTypes = {
    rooms: PropTypes.arrayOf(
        chatRoomPropType
    ),
    user: userPropType,
    isRoomsInitialized: PropTypes.bool
}

const mapStateToProps = (state) => {
    return {
        user: state.user.user,
        isRoomsInitialized: state.chat.isRoomsInitialized,
        isRoomsFetching: state.chat.isRoomsFetching
    }
}

const mapDispatchToProps = {
    updateRoom
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatBarComponent)
export {ChatBarComponent as UnderlyingChatBarComponent}