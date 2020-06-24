import React, {Component} from 'react'
import {getNotifs, createNotif, readNotif, readAllNotifs} from '../../actions/notifications'
import { connect } from "react-redux";
import WebSocketService from "../../accounts/WebSocket";
import NotificationsDisplay from './NotificationsDisplay'
import {IconButton, Tooltip, Badge} from '@material-ui/core'
import AuthenticationService from "../../accounts/AuthenticationService"
import NotificationsIcon from '@material-ui/icons/Notifications';
import styles from '../../styles/notifications.module.css'

class Notifications extends Component {

    constructor(props) {
        super(props);
        this.state = {
          socket: new WebSocketService(),
          open: false,
          anchorRef: null
        };

        this.state.socket.addNotifCallbacks(this.props.createNotif);
    }

    componentDidMount() {
        this.props.getNotifs()
        this.connectSocket();
    }

    connectSocket = () => {
        const token = AuthenticationService.retrieveToken();
        const path = `/ws/user/${this.props.user.id}/`;
        this.state.socket.connect(path, token);
    };

    handleOpen = event => {
        this.setState({open: true, anchorRef: event.currentTarget})
    }

    handleClose = event => {
        this.setState({open: false, anchorRef: null})
    }


    render() {

        return (
            <div className={styles.notifsWrapper}>
                <Tooltip title="Notifications">
                    <IconButton onClick={this.handleOpen} color="primary" className={styles.icon}>
                        <Badge badgeContent={this.props.notifications.length} variant='dot' color="secondary">
                            <NotificationsIcon/>
                        </Badge>
                    </IconButton>
                </Tooltip>
                <NotificationsDisplay 
                    anchorRef={this.state.anchorRef}
                    open={this.state.open}
                    onClose={this.handleClose}
                    notifications={this.props.notifications}
                    readNotif={this.props.readNotif}
                    readAllNotifs={this.props.readAllNotifs}
                />
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        notifications: state.notifs.notifications
    }
}

const mapDispatchToProps = {
    getNotifs,
    createNotif,
    readNotif,
    readAllNotifs
}

export default connect(mapStateToProps, mapDispatchToProps)(Notifications)