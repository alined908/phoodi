import React, { Component } from "react";
import {
  getUserMeetupInvites,
  respondMeetupInvite,
  getUserFriendInvites,
  respondFriendInvite,
  removeNotifs,
} from "../../actions";
import { inviteType } from "../../constants/default-states";
import { connect } from "react-redux";
import { Invite } from "../components";
import { Grid, Typography, IconButton, Tooltip } from "@material-ui/core";
import RefreshIcon from "@material-ui/icons/Refresh";
import PropTypes from "prop-types";
import { invitePropType } from "../../constants/prop-types";
import { Helmet } from "react-helmet";
import styles from "../../styles/friends.module.css";

class Invites extends Component {
  async componentDidMount() {
    await Promise.all([
      this.props.getUserMeetupInvites(),
      this.props.getUserFriendInvites(),
    ]);

    // if (this.props.meetupInvites && this.props.meetupInvites.length === 0){
    //     this.props.removeNotifs({type: "meetup_inv"})
    // }
    // if (this.props.friendInvites && this.props.friendInvites.length > 0){
    //     this.props.removeNotifs({type: "friend_inv"})
    // }
  }

  refreshMeetupInvites = () => {
    console.log("this");
    this.props.getUserMeetupInvites();
  };

  refreshFriendInvites = () => {
    console.log("that");
    this.props.getUserFriendInvites();
  };

  render() {
    return (
      <div className="inner-wrap">
        <Helmet>
          <meta charSet="utf-8" />
          <title>Invites</title>
          <meta name="description" content="Phoodie Invites" />
        </Helmet>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {!this.props.isMeetupInvitesInitialized ? (
              <div>Initializing Meetup Invites..</div>
            ) : (
              <>
                <div className="inner-header elevate">
                  <Typography variant="h5">Meetup Invites</Typography>
                  <Tooltip title="Refresh">
                    <IconButton
                      color="primary"
                      onClick={this.refreshMeetupInvites}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </div>
                <div className={styles.invites}>
                  {this.props.meetupInvites.map((inv) => (
                    <Invite
                      key={inv.id}
                      inv={inv}
                      type={inviteType.meetup}
                    ></Invite>
                  ))}
                </div>
              </>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {!this.props.isFriendInvitesInitialized ? (
              <div>Initializing Friend Invites..</div>
            ) : (
              <>
                <div className="inner-header elevate">
                  <Typography variant="h5">Friend Invites</Typography>
                  <Tooltip title="Refresh">
                    <IconButton
                      color="primary"
                      onClick={this.refreshFriendInvites}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </div>
                <div className={styles.invites}>
                  {this.props.friendInvites.map((inv) => (
                    <Invite
                      key={inv.id}
                      inv={inv}
                      type={inviteType.friend}
                    ></Invite>
                  ))}
                </div>
              </>
            )}
          </Grid>
        </Grid>
      </div>
    );
  }
}

Invites.propTypes = {
  isFriendInvitesInitialized: PropTypes.bool.isRequired,
  isMeetupInvitesInitialized: PropTypes.bool.isRequired,
  meetupInvites: PropTypes.arrayOf(invitePropType),
  friendInvites: PropTypes.arrayOf(invitePropType),
  respondFriendInvite: PropTypes.func.isRequired,
  respondMeetupInvite: PropTypes.func.isRequired,
  getUserMeetupInvites: PropTypes.func.isRequired,
  getUserFriendInvites: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    isFriendInvitesInitialized: state.user.invites.isFriendInvitesInitialized,
    isMeetupInvitesInitialized: state.user.invites.isMeetupInvitesInitialized,
    meetupInvites: state.user.invites.meetups,
    friendInvites: state.user.invites.friends,
  };
}

const mapDispatchToProps = {
  respondFriendInvite,
  respondMeetupInvite,
  getUserMeetupInvites,
  getUserFriendInvites,
  removeNotifs,
};

export default connect(mapStateToProps, mapDispatchToProps)(Invites);
