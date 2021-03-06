import React, { Component } from "react";
import { connect } from "react-redux";
import { Avatar, IconButton, Tooltip, BottomNavigation, BottomNavigationAction} from "@material-ui/core";
import { axiosClient } from "../../accounts/axiosClient";
import {
  getPreferences,
  addPreference,
  editPreference,
  sendFriendInvite,
} from "../../actions";
import { Link } from "react-router-dom";
import {
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  AccountBox as AccountBoxIcon,
  Group as GroupIcon,
  LineWeight as LineWeightIcon
} from "@material-ui/icons";
import {
  Friend,
  CategoryAutocomplete,
  Preferences,
  RegisterPage,
  AuthWrapper,
  FeedActivities
} from "../components";
import PropTypes from "prop-types";
import { userPropType } from "../../constants/prop-types";
import { history } from "../MeetupApp";
import { Helmet } from "react-helmet";
import styles from "../../styles/profile.module.css";
import moment from "moment";

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      userLoaded: false,
      friends: [],
      filteredFriends: [],
      searchInput: "",
      entries: [],
      locked: this.props.location.state
        ? this.props.location.state.locked
        : true,
      editProfileForm: false,
      isMobile: window.matchMedia("(max-width: 1200px)").matches,
      mobileTabIndex: 0
    };
  }

  componentDidMount() {
    const handler = (e) => this.setState({ isMobile: e.matches });
    window.matchMedia("(max-width: 1200px)").addListener(handler);
    this.props.getPreferences(this.props.match.params.id);
    this.getInformation();
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.id !== prevProps.match.params.id) {
      this.props.getPreferences(this.props.match.params.id);
      this.getInformation();
    }
    else if (JSON.stringify(this.props.user) !== JSON.stringify(prevProps.user)){
      this.getInformation();
    }
  }

  getInformation = async () => {
    try {
      const [profile, friends] = await Promise.all([
        axiosClient.get(`/api/users/${this.props.match.params.id}/`),
        axiosClient.get(`/api/users/${this.props.match.params.id}/friends/`),
      ]);
      this.setState({
        user: profile.data,
        friends: friends.data,
        filteredFriends: friends.data,
        userLoaded: true,
      });
    } catch (e) {
      history.push("/404");
    }
  };

  handleLock = () => {
    this.setState({ locked: !this.state.locked });
  };

  onTagsChange = (event, values) => {
    const category = values[0];
    const data = { category_id: category.id };
    this.props.addPreference(data, this.props.user.id);
  };

  openFormModal = () => {
    this.setState({ editProfileForm: !this.state.editProfileForm });
  };

  handleSearchInputChange = (e) => {
    let filter = e.target.value;
    let friends = this.state.friends;
    let newFriends;

    newFriends = friends.filter((friendship) => {
      let friendCriteria = false;
      let friend = friendship.user;
      const friendName = friend.first_name + " " + friend.last_name;
      friendCriteria =
        friendName.toLowerCase().includes(filter.toLowerCase()) ||
        friend.email.toLowerCase().includes(filter.toLowerCase());
      return friendCriteria;
    });

    this.setState({ searchInput: filter, filteredFriends: newFriends });
  };

  handleMobileTabChange = (e, newValue) => {
    this.setState({mobileTabIndex: newValue})
  }

  isUserFriend = () => {
    for (var i = 0; i < this.state.friends.length; i++) {
      let user = this.state.friends[i].user;
      if (user.id === this.props.user.id) {
        return true;
      }
    }

    return false;
  };

  addFriend = () => {
    this.props.sendFriendInvite(this.state.user.email);
  };

  render() {
    const isUser = this.props.user && this.props.user.id && this.props.user.id.toString() === this.props.match.params.id;
    const isUserFriend = !isUser && !this.isUserFriend();
    console.log(this.state.user)
    const renderFriends = () => {
      return (
        <div>
          {this.state.filteredFriends.map((friend) => (
            <div className={styles.friend}>
              <Friend key={friend.id} isUserFriend={isUser} friend={friend} />
            </div>
          ))}
        </div>
      );
    };

    return (
      <div className={`innerWrap  ${this.state.isMobile ? "innerWrap-mobile": ""}`}>
        <Helmet>
          <meta charSet="utf-8" />
          <title>
            {`${
              this.state.user.first_name !== undefined
                ? this.state.user.first_name
                : ""
            } 
                        ${
                          this.state.user.last_name !== undefined
                            ? this.state.user.last_name
                            : ""
                        }`}
          </title>
          <meta name="description" content="Phoodi Profile" />
        </Helmet>
        <div className={`innerLeft ${this.state.isMobile ? "innerLeft-mobile": ""} ${this.state.mobileTabIndex === 0 ? "innerLeft-show" : ""}`}>
          <div className="innerLeftHeader" style={{padding: ".5rem .7rem"}}>
              <span className={styles.userInfo}>
                <Avatar
                    className={styles.userAvatar}
                    src={this.state.user.avatar}
                  >
                  {this.state.user.first_name && this.state.user.first_name.charAt(0)}
                  {this.state.user.last_name && this.state.user.last_name.charAt(0)}
                </Avatar>
                {this.state.user.first_name} {this.state.user.last_name}
              </span>
              {isUserFriend && (
                  <Tooltip title="Add Friend">
                    <AuthWrapper authenticated={this.props.authenticated}>
                      <IconButton color="primary" size="small" onClick={this.addFriend}>
                        <PersonAddIcon />
                      </IconButton>
                    </AuthWrapper>
                  </Tooltip>
                )}
                {isUser && (
                  <Tooltip title="Edit Profile">
                    <IconButton color="primary" onClick={this.openFormModal}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
          </div>
          <div className="innerLeftHeaderBlock">
            <div className="hr">Info</div>
            <div className="innerLeftHeaderBlockAction">
              <div className="blockActionHeader">
                Created
                <span className="blockActionChip">
                  {moment(this.state.user.created_at).fromNow()}
                </span>
              </div>
            </div>
          </div>
          <div className="innerLeftHeaderBlock">
            <div className="hr">Preferences</div>
            <div className="innerLeftHeaderBlockAction">
              <div className="blockActionHeader">
                Modify
                {isUser &&
                  (this.state.locked ? (
                    <Tooltip title="Click to Reorder">
                      <IconButton size="small" color="primary" onClick={this.handleLock}>
                        <LockIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Click to Lock">
                      <IconButton size="small" onClick={this.handleLock}>
                        <LockOpenIcon />
                      </IconButton>
                    </Tooltip>
                  ))}         
              </div>
              <div className="blockActionContent">
                {isUser && (
                  <CategoryAutocomplete
                    fullWidth={true}
                    size="small"
                    entries={this.state.entries}
                    handleClick={this.onTagsChange}
                    label="Search to add categories.."
                  />
                )}
              </div>
            </div>
            <Preferences locked={this.state.locked} isUser={isUser} />
          </div>
        </div>
        <div className={`innerRight ${this.state.isMobile ? "innerRight-mobile": ""} ${this.state.mobileTabIndex === 1 ? "innerRight-show" : ""}`}>
          <div className="innerRightBlock">
              {this.state.userLoaded && 
                <FeedActivities 
                    isActivitiesFetching={false}
                    isActivitiesInitialized={true}
                    activities={this.state.user.activities}
                    user={this.state.user}
                />
              }
          </div>
        </div>
        <div className={`innerLeft ${this.state.isMobile ? "innerLeft-mobile": ""} ${this.state.mobileTabIndex === 2 ? "innerLeft-show" : ""} ${styles.profileFriends}`}>
          <div className="innerLeftHeaderBlock">
            <div className="hr">Friends</div>
            <div className="innerLeftHeaderBlockAction">
              <div className="blockActionHeader">
                  Search Friends
              </div>
              <div className="blockActionContent">
                <input
                  className="input"
                  type="text"
                  placeholder="Search..."
                  value={this.state.searchInput}
                  onChange={this.handleSearchInputChange}
                />
              </div>
            </div>
            
            {this.state.userLoaded && renderFriends()}
          </div>
        </div>
        {this.state.isMobile && 
          <div className="innerWrap-mobileControl">
            <BottomNavigation value={this.state.mobileTabIndex} onChange={this.handleMobileTabChange} showLabels>
                <BottomNavigationAction label="Profile" icon={<AccountBoxIcon/>}/>
                <BottomNavigationAction label="Activity" icon={<LineWeightIcon/>}/>
                <BottomNavigationAction label="Friends" icon={<GroupIcon/>}/>
            </BottomNavigation>
          </div>
        }
        {this.state.editProfileForm && (
          <RegisterPage
            type="edit"
            handleClose={this.openFormModal}
            open={this.state.editProfileForm}
          />
        )}
      </div>
      
    );
  }
}

Profile.propTypes = {
  user: userPropType,
  getPreferences: PropTypes.func.isRequired,
  addPreference: PropTypes.func.isRequired,
  editPreference: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    user: state.user.user,
    authenticated: state.user.authenticated
  };
}

const mapDispatchToProps = {
  getPreferences,
  addPreference,
  editPreference,
  sendFriendInvite,
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
