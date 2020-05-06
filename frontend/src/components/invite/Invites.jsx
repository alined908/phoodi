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
import { Grid, Button, CircularProgress } from "@material-ui/core";
import PropTypes from "prop-types";
import { invitePropType } from "../../constants/prop-types";
import { Helmet } from "react-helmet";

class Invites extends Component {
  async componentDidMount() {
    await Promise.all([
      this.props.getUserMeetupInvites(),
      this.props.getUserFriendInvites(),
    ]);

    if (this.props.meetupInvites && this.props.meetupInvites.length > 0){
        this.props.removeNotifs({type: "meetup_inv"})
    }
    if (this.props.friendInvites && this.props.friendInvites.length > 0){
        this.props.removeNotifs({type: "friend_inv"})
    }
  }

  refreshMeetupInvites = () => {
    this.props.getUserMeetupInvites();
  };

  refreshFriendInvites = () => {
    this.props.getUserFriendInvites();
  };

  render() {
    return (
      <div className="innerWrap">
        <Helmet>
          <meta charSet="utf-8" />
          <title>Invites</title>
          <meta name="description" content="Invites" />
        </Helmet>
        <div className="innerLeft">
          <div className="innerLeftHeader">
            Invites
          </div>
          <div className="innerLeftHeaderBlock">
            <div className="hr">Meetups</div>
            <div className="innerLeftHeaderBlockAction">
              <div className="blockActionHeader">
                Actions
              </div>
              <div className="blockActionContent">
                <Button onClick={this.refreshMeetupInvites} variant="contained" color="primary">
                  Refresh
                </Button>
              </div>
            </div>
          </div>
          <div className="innerLeftHeaderBlock">
            <div className="hr">Friends</div>
            <div className="innerLeftHeaderBlockAction">
              <div className="blockActionHeader">
                Actions
              </div>
              <div className="blockActionContent">
                <Button onClick={this.refreshFriendInvites} variant="contained" color="primary">
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="innerRight">
          <div className="innerRightBlock">
            <div className="innerRightBlockHeader">
              <div className="hr">Meetups</div>
              {this.props.isMeetupInvitesFetching && 
                <div className="loading">
                  <CircularProgress size={30}/>
                </div>
              }
              {this.props.isMeetupInvitesInitialized && 
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                      {this.props.meetupInvites.map((inv) => (
                        <Invite
                          key={inv.id}
                          inv={inv}
                          type={inviteType.meetup}
                        ></Invite>
                      ))}
                  </Grid>
                </Grid>
              }
            </div>
          </div>
          <div className="innerRightBlock">
            <div className="innerRightBlockHeader">
              <div className="hr">Friends</div>
              {this.props.isFriendsInvitesFetching && 
                <div className="loading">
                  <CircularProgress size={30}/>
                </div>
              }
              {this.props.isFriendInvitesInitialized && 
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    {this.props.friendInvites.map((inv) => (
                      <Invite
                        key={inv.id}
                        inv={inv}
                        type={inviteType.friend}
                      ></Invite>
                    ))}
                  </Grid>
                </Grid>
              }
            </div>
          </div>
        </div>
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
    isFriendInvitesFetching: state.user.invites.isFriendInvitesFetching,
    isMeetupInvitesFetching: state.user.invites.isMeetupInvitesFetching,
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
