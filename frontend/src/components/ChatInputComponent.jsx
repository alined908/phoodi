import React, {Component} from 'react'
import {connect} from 'react-redux';
import {setTypingValue, addMessage} from "../actions/chat";


class ChatInputComponent extends Component{
    handleChange = (e) => {
        console.log(e.target.value);
        this.props.setTypingValue(e.target.value);        
    }

    handleSubmit = (e) => {
        if (e.key === "Enter"){
            e.preventDefault();
            this.props.addMessage(e.target.value, this.props.room)
        }
    }

    render(){
        return (
            <form className="chat-input-form">
                <input className="chat-input"
                    type="text"
                    onChange={this.handleChange} 
                    onKeyPress={this.handleSubmit}
                    value={this.props.message} 
                    placeholder="Type here to send a message">
                </input>
            </form>
        )
    } 
}

function mapStateToProps(state){
    return {
        message: state.chat.setTypingValue,
        room: state.chat.activeRoom
    }
}

const mapDispatchToProps = {
    setTypingValue,
    addMessage
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatInputComponent)