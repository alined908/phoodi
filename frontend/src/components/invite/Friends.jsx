import React, { Component } from "react";
import {
  getFriends,
  deleteFriend,
  sendFriendInvite,
  addGlobalMessage,
  removeNotifs,
} from "../../actions";
import { connect } from "react-redux";
import { Button, Typography, Grid, CircularProgress } from "@material-ui/core";
import { Friend, UserAutocomplete } from "../components";
import PropTypes from "prop-types";
import { friendPropType, userPropType } from "../../constants/prop-types";
import { Helmet } from "react-helmet";
import styles from "../../styles/friends.module.css";

class Friends extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleType = this.handleType.bind(this);
  }

  componentDidMount() {
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

  render() {
    return (
      <div className="innerWrap">
        <Helmet>
          <meta charSet="utf-8" />
          <title>Friends</title>
          <meta name="description" content="Friends" />
        </Helmet>
        <div className="innerLeft">
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
        <div className="innerRight">
          <div className="innerRightBlock">
            <div className="innerRightBlockHeader">
              <div className="hr">Friends</div>
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
        </div>
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
