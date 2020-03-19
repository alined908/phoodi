import React, {Component} from "react"
import {connect} from 'react-redux';
import AuthenticationService from "../../accounts/AuthenticationService"
import WebSocketService from '../../accounts/WebSocket';
import {getNumberNotifs} from "../../actions/notifications"

class NotificationWrapper extends Component {
    constructor(props){
        super(props)
        this.state = {
            socket: new WebSocketService()
        }
        this.state.socket.addNotifCallbacks(this.props.getNumberNotifs)
    }

    componentDidMount(){
        console.log("notification wrapper app component did mount")
        if (this.props.authenticated) {
            this.connectSocket()
        }
    }

    componentDidUpdate(prevProps){
        if(this.props.authenticated !== prevProps.authenticated){
            if(this.state.socket.exists()) {
                this.state.socket.disconnect()
            } else {
                this.connectSocket()
            }
        }
    }

    connectSocket = () => {
        const token = AuthenticationService.retrieveToken()
        const path = `/ws/user/${this.props.user.id}/?token=${token}`;
        this.state.socket.connect(path);
        this.state.socket.waitForSocketConnection(()=>this.state.socket.fetchNotifications({user: this.props.user.id}))
    }

    render() {
        return (
            <></>
        )
    }
}   

function mapStateToProps(state) {
    return {
      authenticated: state.user.authenticated,
      user: state.user.user,
    }
  }
  
  const mapDispatchToProps = {
    getNumberNotifs
  }

export default connect(mapStateToProps, mapDispatchToProps)(NotificationWrapper)