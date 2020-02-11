import React, {Component} from 'react';
import Contact from "./ContactComponent";
import {connect} from 'react-redux';
import {getRooms} from '../../actions/chat';

class ChatBarComponent extends Component {
    componentDidMount(){
        this.props.getRooms();
    }

    render (){
        return(
            <div className="chat-bar">
                {!this.props.isRoomsInitialized && <div>Initializing Contacts...</div>}
                {this.props.isRoomsInitialized && this.props.rooms.map((room) => 
                    <Contact key={room.id} room={Object.values(room)}></Contact>
                )}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isRoomsInitialized: state.chat.isRoomsInitialized,
        rooms: Object.values(state.chat.rooms)
    }
}

const mapDispatchToProps = {
    getRooms
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatBarComponent)