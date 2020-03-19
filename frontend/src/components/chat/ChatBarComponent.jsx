import React, {Component} from 'react';
import {ContactComponent} from "../components";
import {connect} from 'react-redux';
import {IconButton, Tooltip} from '@material-ui/core'
import {Event as EventIcon, Person as PersonIcon, Search as SearchIcon, Error as ErrorIcon} from '@material-ui/icons';
const opposite = {"friend": "meetup", "meetup": "friend"}

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
            searchInput: ''
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.rooms !== prevProps.rooms) {
            this.setState({rooms: this.props.rooms, liveRooms: this.props.rooms})
        }
    }

    filterRooms = (type) => {
        var rooms = this.state.isSearched ? this.state.searchedRooms : this.state.rooms;
        var isFiltered;
        var newRooms; 

        if (!this.state.filters[type]) {
            if (!this.state.filters[opposite[type]]){
                newRooms = rooms.filter(room => (type === "meetup" ? room.meetup === null : room.friendship === null))
            } else {
                newRooms = []
            }
            isFiltered = true
        } else {
            if (!this.state.filters[opposite[type]]){
                newRooms = rooms
                isFiltered = false
            } else {
                newRooms = rooms.filter(room => (type === "meetup" ?  room.friendship === null : room.meetup === null))
                isFiltered = true
            }
        }

        var filters = {...this.state.filters}
        filters[type] = !filters[type]
        this.setState({filters, isFiltered, filteredRooms: newRooms, liveRooms: newRooms})
    }

    handleSearchInputChange = (e) => {
        var filter = e.target.value;
        var rooms = this.state.isFiltered ? this.state.filteredRooms : this.state.rooms;
        var isSearched = e.target.value.length === 0 ? false : true;
        var newRooms;

        newRooms = rooms.filter((room) => {
            let meetupCriteria = false;
            if (room.meetup !== null) {
                meetupCriteria = room.name.toLowerCase().includes(filter.toLowerCase())
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

                friendCriteria = (friendName.toLowerCase().includes(filter.toLowerCase())) || (friend.email.toLowerCase().includes(filter.toLowerCase()))
            }

            return meetupCriteria || friendCriteria
        })

        this.setState({searchInput: filter, isSearched, searchedRooms: newRooms, liveRooms: newRooms})
    }

    render (){
        const rooms = this.state.liveRooms

        return (
            <div className="chat-bar elevate">
                {!this.props.isRoomsInitialized && <div>Initializing Contacts...</div>}
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
                    {(this.props.isRoomsInitialized && rooms.length === 0) && 
                        <div className="chat-bar-none">
                            <ErrorIcon style={{color: "rgb(255, 212, 96)"}}/> &nbsp; No chat rooms match criteria!
                        </div>
                    }
                    {this.props.isRoomsInitialized && rooms.map((room) => 
                        <ContactComponent user={this.props.user} key={room.id} room={Object.values(room)}></ContactComponent>
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

const mapStateToProps = (state) => {
    return {
        user: state.user.user,
        isRoomsInitialized: state.chat.isRoomsInitialized
    }
}

export default connect(mapStateToProps)(ChatBarComponent)