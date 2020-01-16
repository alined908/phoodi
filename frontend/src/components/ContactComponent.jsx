import React, {Component} from 'react'
import {connect} from 'react-redux';
import {setActiveRoom} from '../actions/chat';

class ContactComponent extends Component {
    handleClick = (uri) => {
        console.log("handle click")
        this.props.setActiveRoom(uri);
    }
    
    render (){
        const [id, uri, name, timestamp, members] = this.props.room

        return (
            <div className="chat-contact" onClick={() => this.handleClick(uri)}>
                <div>{name}</div>
                <div>{Object.keys(members).length + " Members"}</div>
            </div>
        )
    }
}
const mapDispatchToProps = {
    setActiveRoom
}

export default connect(null, mapDispatchToProps)(ContactComponent)