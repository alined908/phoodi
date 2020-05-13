import React, { Component } from "react";
import {
  getFriends,
  deleteFriend,
  sendFriendInvite,
  addGlobalMessage,
  removeNotifs,
} from "../../actions";
import { connect } from "react-redux";
import {People as PeopleIcon, PersonAdd as PersonAddIcon} from '@material-ui/icons'
import { Button, Grid, CircularProgress, BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import { Friend, UserAutocomplete } from "../components";
import PropTypes from "prop-types";
import { friendPropType, userPropType } from "../../constants/prop-types";
import { Helmet } from "react-helmet";

class Friends extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      isMobile: window.matchMedia("(max-width: 768px)").matches,
      mobileTabIndex: 0
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleType = this.handleType.bind(this);
  }

  componentDidMount() {
    const handler = (e) => this.setState({ isMobile: e.matches });
    window.matchMedia("(max-width: 768px)").addListener(handler);
    this.props.getFriends(this.props.user.id);
    if (this.props.notifs !== null && this.props.notifs > 0) {
      this.props.removeNotifs({ type: "friend" });
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.props.user.email === this.state.email) {
      this.props.addGlobalMessage("error", "Cannot invite yourself.");
    } else {
      this.props.sendFriendInvite(this.state.email);
    }
  };

  handleType = (e) => {
    this.setState({ email: e.target.value });
  };

  handleClick = (e, value) => {
    let email;
    if (value === null) {
      email = "";
    } else {
      email = value.email;
    }
    this.setState({ email });
  };

  handleMobileTabChange = (e, newValue) => {
    this.setState({mobileTabIndex: newValue})
  }

  render() {
    return (
      <div className={`innerWrap  ${this.state.isMobile ? "innerWrap-mobile": ""}`}>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Friends</title>
          <meta name="description" content="Friends" />
        </Helmet>
        <div className={`innerLeft ${this.state.isMobile ? "innerLeft-mobile": ""} ${this.state.mobileTabIndex === 0 ? "innerLeft-show" : ""}`}>
          <div className="innerLeftHeader">Friends</div>
          <div className="innerLeftHeaderBlock">
            <div className="hr">Actions</div>
            <div className="innerLeftHeaderBlockAction">
              <div className="blockActionHeader">
                Add Friend 

                <Button
                  size="small"
                  type="submit"
                  onClick={this.handleSubmit}
                  variant="contained"
                  color="primary"
                >
                  Send
                </Button>
              </div>
              <div className="blockActionContent" style={{marginTop: ".5rem"}}>
                <UserAutocomplete
                  handleClick={this.handleClick}
                  handleType={this.handleType}
                />
                
              </div>
            </div>
          </div>
        </div>
        <div  className={`innerRight ${this.state.isMobile ? "innerRight-mobile": ""} ${this.state.mobileTabIndex === 0 ? "" : "innerRight-show"}`}>
          <div className="innerRightBlock">
            {this.props.isFriendsFetching && 
              <div className="loading">
                <CircularProgress size={30}/>
              </div>
            }
            {this.props.isFriendsInitialized && (
              <Grid container spacing={3}>
                {this.props.friends.map((friend) => (
                  <Grid key={friend.id} item xs={12} md={6} lg={4}>
                    <div className="elevate-0">
                      <Friend
                        user={this.props.user}
                        isUserFriend={true}
                        friend={friend}
                        deleteFriend={this.props.deleteFriend}
                      />
                    </div>
                  </Grid>
                ))}
              </Grid>
            )}
          </div>
        </div>
        {this.state.isMobile && 
          <div className="innerWrap-mobileControl">
            <BottomNavigation value={this.state.mobileTabIndex} onChange={this.handleMobileTabChange} showLabels>
                <BottomNavigationAction label="Add Friend" icon={<PersonAddIcon/>}/>
                <BottomNavigationAction label="Friends" icon={<PeopleIcon/>}/>
            </BottomNavigation>
          </div>
        }
      </div>
    );
  }
}

Friends.propTypes = {
  user: userPropType,
  friends: PropTypes.arrayOf(friendPropType),
  isFriendsInitialized: PropTypes.bool.isRequired,
  notifs: PropTypes.number,
  getFriends: PropTypes.func.isRequired,
  deleteFriend: PropTypes.func.isRequired,
  removeNotifs: PropTypes.func.isRequired,
  sendFriendInvite: PropTypes.func.isRequired,
  addGlobalMessage: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.user.user,
    friends: state.user.friends,
    isFriendsInitialized: state.user.isFriendsInitialized,
    isFriendsFetching: state.user.isFriendsFetching,
    notifs: state.notifs.friend,
  };
}

const mapDispatchToProps = {
  getFriends,
  deleteFriend,
  removeNotifs,
  sendFriendInvite,
  addGlobalMessage,
};

export default connect(mapStateToProps, mapDispatchToProps)(Friends);
