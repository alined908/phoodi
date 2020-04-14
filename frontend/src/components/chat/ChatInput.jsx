import React, {Component} from 'react'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
import {Button} from '@material-ui/core'
import ReactDOM from 'react-dom'

class ChatInput extends Component {
    constructor(props){
        super(props)
        this.state = {
            value: "",
            showEmojis: false
        }
        this.emojiPicker = React.createRef();
        this.showEmojis = this.showEmojis.bind(this)
    }
    
    //Add Event listener for emoji picker outside click
    componentDidMount(){
        document.addEventListener('mousedown', this.handleOutsideClick, false);
    }

    //If Component unmounts remove outsideclick event listener
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleOutsideClick, false);
    }

    //If Send button is clicked
    handleClick = (e) => {
        this.sendMessage()
    }

    //If enter button is hit
    handleSubmit = (e) => {
        if (e.key === "Enter"){
            e.preventDefault();
            this.sendMessage()
        }
    }

    // Handle Change in text input
    handleChange = (e) => {
        this.setState({value: e.target.value})       
    }

    //Send Message with websocket
    sendMessage = () => {
        if (this.state.value.length > 0 ){
            const messageObject = {from: this.props.user.id, text: this.state.value, room: this.props.room.uri}
            this.setState({value: ""}, () => this.props.socket.newChatMessage(messageObject))
        } 
    }

    //Add Emoji to Text Input
    addEmoji = e => {
        let emoji = e.native;
        this.setState({
            value: this.state.value + emoji
        })
    }

    //Show Emoji Picker
    showEmojis = (e) => {
        this.setState({showEmojis: !this.state.showEmojis})
    }

    //Handle Emoji Picker Outside Click
    handleOutsideClick = (e) => {
        try {
            let node = ReactDOM.findDOMNode(this.emojiPicker.current)
            if (!node.contains(e.target)){
                this.setState({showEmojis: false})
            }   
        } catch(error){
            return null
        }
    }

    render(){
        return (
            <>
                {!this.props.bound && 
                    <div className="more-messages">
                        <Button size="small" onClick={() => this.props.scrollToBottom()} 
                            variant="contained" color="primary" style={{opacity: ".6", fontSize: ".7rem"}}
                        >
                            More Messages Below
                        </Button>
                    </div>
                    }
                <form className="chat-input-form">
                    <input className="chat-input"
                        type="text"
                        onChange={this.handleChange} 
                        onKeyPress={this.handleSubmit}
                        value={this.state.value} 
                        placeholder="Type a message here...">
                    </input>
                </form>
                {this.state.showEmojis ?
                    <>
                        <div className="emoji-picker-icon" onClick={this.showEmojis}>
                        {String.fromCodePoint(0x1F62D)}
                        </div>
                        <div className="emoji-picker elevate">
                            <Picker ref={this.emojiPicker} title='Pick your emoji…' emoji='point_up' sheetSize={32} emojiSize={22} onSelect={this.addEmoji}/>
                        </div>
                    </>:
                    <div className="emoji-picker-icon" onClick={this.showEmojis}>
                        {String.fromCodePoint(0x1f60a)}
                    </div>
                } 
                <div>
                    <Button onClick={() => this.handleClick()} 
                        style={{borderRadius: 15, fontSize: 10, fontFamily: "Lato", 
                        fontWeight: "700", backgroundColor: "#FFD460"}}
                    >
                        Send
                    </Button>
                </div>
            </>
        )
    }
}

export default ChatInput