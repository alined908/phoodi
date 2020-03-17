import React, {Component} from 'react';
import {ContactComponent} from "../components";
import {connect} from 'react-redux';

class ChatBarComponent extends Component {

    render (){
        return(
            <div className="chat-bar">
                {!this.props.isRoomsInitialized && <div>Initializing Contacts...</div>}
                <div className="chat-bar-top">Contacts</div>
                {this.props.isRoomsInitialized && this.props.rooms.map((room) => 
                    <ContactComponent key={room.id} room={Object.values(room)}></ContactComponent>
                )}
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        isRoomsInitialized: state.chat.isRoomsInitialized
    }
}

export default connect(mapStateToProps)(ChatBarComponent)