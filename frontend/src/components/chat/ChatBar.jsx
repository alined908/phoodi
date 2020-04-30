import React, {Component} from 'react';
import {Contact} from "../components";
import {connect} from 'react-redux';
import {IconButton, Tooltip, CircularProgress} from '@material-ui/core'
import {Event as EventIcon, Person as PersonIcon, Search as SearchIcon, Error as ErrorIcon} from '@material-ui/icons';
import PropTypes from 'prop-types';
import {chatRoomPropType, userPropType,} from "../../constants/prop-types"
import WebSocketService from "../../accounts/WebSocket"
import AuthenticationService from '../../accounts/AuthenticationService';
import {updateRoom} from '../../actions'
import styles from '../../styles/chat.module.css'

class ChatBar extends Component {
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

    // Initialize socket for chat rooms.
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
        const rooms = this.state.rooms
        const filter = this.state.searchInput
        const filterMeetup = this.state.filters["meetup"]
        const filterFriend = this.state.filters["friend"]
        let newRooms;

        newRooms = rooms.filter((room) => {
        
            let meetupCriteria = false;
            if (room.meetup !== null) {
                meetupCriteria = room.name.toLowerCase().includes(filter.toLowerCase()) && !filterMeetup
            }

            let friendCriteria = false;
            if (room.friendship !== null){
                const user = this.props.user
                let friend;
                for (let key in room.members){
                    if (key !== user.id.toString()){
                        friend = room.members[key]
                    }
                }
                const friendName = `${friend.first_name} ${friend.last_name}`

                friendCriteria = (
                    (friendName.toLowerCase().includes(filter.toLowerCase())) || 
                    (friend.email.toLowerCase().includes(filter.toLowerCase()))
                ) && !filterFriend
            }

            return meetupCriteria || friendCriteria
        })

        this.setState({liveRooms: newRooms})
    }

    filterRooms = (type) => {
        let filters = {...this.state.filters}
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
            <div className={styles.bar}>
                <div className={styles.barTop}>
                    <div>Contacts</div>
                    <div>
                        <Tooltip title="Friends">
                            <IconButton 
                                color={this.state.filters["friend"] ? "default" : "primary"} 
                                onClick={() => this.filterRooms("friend")} edge="end"
                            >
                                <PersonIcon/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Meetups">
                            <IconButton 
                                color={this.state.filters["meetup"] ? "default" : "primary"} 
                                onClick={() => this.filterRooms("meetup")}
                            >
                                <EventIcon/>
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
                <div className={styles.contacts}>
                    {this.props.isRoomsFetching && 
                        <div className="loading">
                            <CircularProgress/>
                        </div>
                    }
                    {(this.props.isRoomsInitialized && rooms.length === 0) && 
                        <div className="no-entity">
                            <ErrorIcon style={{color: "rgb(255, 212, 96)"}}/>
                            <span className="no-entity-text">
                                No chat rooms match criteria!
                            </span>
                        </div>
                    }
                    {this.props.isRoomsInitialized && rooms.map((room) => 
                        <Contact 
                            key={room.id}
                            room={room}
                            user={this.props.user} 
                            currentRoom={this.props.currentRoom}
                        />
                    )}
                </div>
                <div className={styles.search}>
                    <SearchIcon/>
                    <input 
                        type="text"
                        className={styles.input} 
                        placeholder="Search Contacts..." 
                        value={this.state.searchInput} 
                        onChange={this.handleSearchInputChange}
                    />
                </div>
            </div>
        )
    }
}

ChatBar.propTypes = {
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
        isRoomsFetching: state.chat.isRoomsFetching,
        currentRoom: state.chat.activeRoom
    }
}

const mapDispatchToProps = {
    updateRoom
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatBar)
export {ChatBar as UnderlyingChatBar}