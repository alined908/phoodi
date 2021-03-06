import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Avatar, Badge } from "@material-ui/core";
import NotificationsIcon from "@material-ui/icons/Notifications";
import { GroupAvatars } from "../components";
import moment from "moment";
import PropTypes from "prop-types";
import { userPropType, chatRoomPropType } from "../../constants/prop-types";
import styles from "../../styles/chat.module.css";

class Contact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifs: this.props.room.notifs,
    };
  }

  /**
   * Remove notifications alert when clicked.
   * @param {number} id - Id of room
   */
  // handleClick = (id) => {
  //   this.props.onShow();
  //   if (this.state.notifs > 0) {
  //     this.setState({ notifs: 0 }, () =>
  //       this.props.removeNotifs({ type: "chat_message", id: id })
  //     );
  //   }
  // };

  render() {
    const room = this.props.room;
    const isCurrentRoom = this.props.currentRoom === room.uri;
    const membersKeys = Object.keys(room.members);

    return (
      <Link
        key={room.id}
        to={`/chat/${room.uri}`}
        onClick={
          room.notifs > 0 || this.props.mobile
            ? () => this.handleClick(room.id)
            : null
        }
      >
        <div
          className={`${styles.contact} ${
            isCurrentRoom ? styles.currentRoom : ""
          }`}
        >
          <div>
            <div>{room.name}</div>
            {room.meetup ? (
              <div className={styles.avatars}>
                <GroupAvatars members={Object.values(room.members)} />
                {membersKeys.length + " member"}
                {membersKeys.length > 1 ? "s" : ""}
              </div>
            ) : (
              <>
                {membersKeys.map((member) =>
                  member !== this.props.user.id.toString() ? (
                    <div key={member} className={styles.contactInfo}>
                      <div className={styles.contactAvatar}>
                        <Avatar src={room.members[member].avatar}>
                          {room.members[member].first_name.charAt(0)}
                          {room.members[member].last_name.charAt(0)}
                        </Avatar>
                      </div>
                      <div className={styles.contactUserInfo}>
                        <div>
                          {room.members[member].first_name}{" "}
                          {room.members[member].last_name}
                        </div>
                        <div className={styles.contactUserEmail}>
                          {room.members[member].email}
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )
                )}
              </>
            )}
          </div>
          <div className={styles.contactTime}>
            {moment(room.last_updated).fromNow()}
          </div>
          {this.state.notifs > 0 && (
            <div>
              <Badge
                color="secondary"
                variant="dot"
                badgeContent={this.state.notifs}
              >
                <NotificationsIcon />
              </Badge>
            </div>
          )}
        </div>
      </Link>
    );
  }
}

Contact.propTypes = {
  room: chatRoomPropType,
  user: userPropType,
  currentRoom: PropTypes.string
};

export default Contact;
