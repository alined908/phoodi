import React, { Component } from "react";
import {
  getUserMeetupInvites,
  respondMeetupInvite,
  getUserFriendInvites,
  respondFriendInvite,
} from "../../actions";
import {Mail as MailIcon, Refresh as RefreshIcon} from '@material-ui/icons'
import { inviteType } from "../../constants/default-states";
import { connect } from "react-redux";
import { Invite } from "../components";
import { Grid, Button, CircularProgress, BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import PropTypes from "prop-types";
import { invitePropType } from "../../constants/prop-types";
import { Helmet } from "react-helmet";

class Invites extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobile: window.matchMedia("(max-width: 768px)").matches,
      mobileTabIndex: 0
    }
  }

  async componentDidMount() {
    const handler = (e) => this.setState({ isMobile: e.matches });
    window.matchMedia("(max-width: 768px)").addListener(handler);
    await Promise.all([
      this.props.getUserMeetupInvites(),
      this.props.getUserFriendInvites(),
    ]);
  }

  refreshMeetupInvites = () => {
    this.props.getUserMeetupInvites();
    this.handleMobileTabChange(null, 1)
  };

  refreshFriendInvites = () => {
    this.props.getUserFriendInvites();
    this.handleMobileTabChange(null, 1)
  };

  handleMobileTabChange = (e, newValue) => {
    this.setState({mobileTabIndex: newValue})
  }

  render() {
    return (
      <div className={`innerWrap  ${this.state.isMobile ? "innerWrap-mobile": ""}`}>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Invites</title>
          <meta name="description" content="Invites" />
        </Helmet>
        <div className={`innerLeft ${this.state.isMobile ? "innerLeft-mobile": ""} ${this.state.mobileTabIndex === 0 ? "innerLeft-show" : ""}`}>
          <div className="innerLeftHeader">
            Invites
          </div>
          <div className="innerLeftHeaderBlock">
            <div className="hr">Meetups</div>
            <div className="innerLeftHeaderBlockAction">
              <div className="blockActionHeader">
                Actions
                <Button size="small" onClick={this.refreshMeetupInvites} variant="contained" color="primary">
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
                <Button size="small" onClick={this.refreshFriendInvites} variant="contained" color="primary">
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className={`innerRight ${this.state.isMobile ? "innerRight-mobile": ""} ${this.state.mobileTabIndex === 0 ? "" : "innerRight-show"}`}>
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
        {this.state.isMobile && 
            <div className="innerWrap-mobileControl">
              <BottomNavigation value={this.state.mobileTabIndex} onChange={this.handleMobileTabChange} showLabels>
                  <BottomNavigationAction label="Refresh" icon={<RefreshIcon/>}/>
                  <BottomNavigationAction label="Invites" icon={<MailIcon/>}/>
              </BottomNavigation>
            </div>
          }
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
};

export default connect(mapStateToProps, mapDispatchToProps)(Invites);
