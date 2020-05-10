import React, { Component } from "react";
import { connect } from "react-redux";
import { voteStatus } from "../../constants/default-states";
import {
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ThumbDownOutlined as ThumbDownOutlinedIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Cancel as CancelIcon,
  CancelOutlined as CancelOutlinedIcon,
  Room as RoomIcon,
  Phone as PhoneIcon,
  Launch as LaunchIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon,
  MoreVert as MoreVertIcon
} from "@material-ui/icons";
import RestaurantPreview from "../restaurant/RestaurantPreview";
import { Link } from "react-router-dom";
import { ADD_GLOBAL_MESSAGE } from "../../constants/action-types";
import { Rating } from "../components";
import { Avatar, Tooltip, IconButton, Menu, MenuItem , ListItemIcon, Typography } from "@material-ui/core";
import PropTypes from "prop-types";
import {
  meetupEventOptionPropType,
  meetupMemberPropType,
  userPropType,
} from "../../constants/prop-types";
import styles from "../../styles/meetup.module.css";

class MeetupEventOption extends Component {
  constructor(props) {
    super(props);
    this.state = {
      preview: false,
      anchor: null,
      hover: false
    };
  }

  determineNumVotes = () => {
    let scores = { 1: 0, 2: 0, 3: 0 };
    for (let key in this.props.option.votes) {
      var vote = this.props.option.votes[key];
      scores[vote.status] += 1;
    }
    return scores;
  };

  determineStatus = () => {
    const user = this.props.user.id;
    if (user in this.props.option.votes) {
      return this.props.option.votes[user].status;
    }
    return 0;
  };

  determineClicked = (status, option) => {
    return status === option;
  };

  handleClick = (status) => {
    //If vote is ban and option vote is not ban and option is not banned and already used ban
    if (!this.props.isUserMember || this.props.isPast) {
      return;
    }
    let check = true;

    if (
      status === voteStatus.ban &&
      !this.props.option.banned &&
      this.props.members[this.props.user.id].ban
    ) {
      this.props.dispatch({
        type: ADD_GLOBAL_MESSAGE,
        payload: { type: "error", message: "Already used ban" },
      });
      check = false;
    }
    if (
      this.props.option.banned &&
      (this.props.user.id in this.props.option.votes
        ? this.props.option.votes[this.props.user.id].status !== voteStatus.ban
        : true)
    ) {
      this.props.dispatch({
        type: ADD_GLOBAL_MESSAGE,
        payload: { type: "error", message: "Cant vote on banned option" },
      });
      check = false;
    }

    if (check) {
      this.props.socket.voteMeetupEvent({
        user: this.props.user.id,
        option: this.props.option.id,
        status: status,
        meetup: this.props.meetup,
      });
    }
  };

  handleDeleteOption = () => {
    if (window.confirm("Are you sure you want to delete")) {
      const option = this.props.option.id;
      this.props.socket.deleteEventOption({
        user: this.props.user.id,
        option: option,
        meetup: this.props.meetup,
        event: this.props.event,
      });
    }
  };

  handleMenuClick = (e) => {
    this.setState({anchor: e.currentTarget})
  }

  handleMenuClose  = () => {
    this.setState({anchor: null})
  }

  handlePreview = () => {
    this.setState({ preview: !this.state.preview });
  };

  renderActions = (status, scores, banned) => {
    const [like, dislike, ban] = [
      this.determineClicked(status, voteStatus.like),
      this.determineClicked(status, voteStatus.dislike),
      this.determineClicked(status, voteStatus.ban),
    ];
    const checkOwn = (status) => {
      if (
        this.props.user.id in this.props.option.votes &&
        this.props.option.votes[this.props.user.id].status === status
      ) {
        return styles.myclick;
      } else {
        return "";
      }
    };

    return (
      <div className={styles.rstActions}>
        <div className={`${styles.rstActionIcon} ${checkOwn(voteStatus.like)}`}>
          {!like ? (
            <Tooltip title="Like">
              <ThumbUpOutlinedIcon
                disabled={banned}
                className={styles.clickable}
                onClick={() => this.handleClick(voteStatus.like)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Undo Like">
              <ThumbUpIcon
                disabled={banned}
                className={styles.clickable}
                color="primary"
                onClick={() => this.handleClick(voteStatus.like)}
              />
            </Tooltip>
          )}
          <span className={styles.rstActionScore}>
              {scores[1]}
          </span>
        </div>
        <div
          className={`${styles.rstActionIcon} ${checkOwn(voteStatus.dislike)}`}
        >
          {!dislike ? (
            <Tooltip title="Dislike">
              <ThumbDownOutlinedIcon
                disabled={banned}
                className={styles.clickable}
                onClick={() => this.handleClick(voteStatus.dislike)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Undo Dislike">
              <ThumbDownIcon
                disabled={banned}
                className={styles.clickable}
                onClick={() => this.handleClick(voteStatus.dislike)}
              />
            </Tooltip>
          )}
          <span className={styles.rstActionScore}>
              {scores[2]}
          </span>
        </div>
        <div className={`${styles.rstActionIcon} ${checkOwn(voteStatus.ban)}`}>
          {!banned ? (
            <Tooltip title="Ban">
              <CancelOutlinedIcon
                className={styles.clickable}
                onClick={() => this.handleClick(voteStatus.ban)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Undo Ban">
              <CancelIcon
                disabled={!ban}
                className={styles.clickable}
                color="secondary"
                onClick={() => this.handleClick(voteStatus.ban)}
              />
            </Tooltip>
          )}
          <span className={styles.rstActionScore}>
              {scores[3]}
          </span>
        </div>
      </div>
    );
  };

  renderRestauraunt = (data, isNotChosen) => {
    const banned = this.props.option.banned;
    const scores = this.determineNumVotes();
    const status = this.determineStatus();

    return (
      <>
        <div 
            className={styles.rst} 
            onMouseEnter={() => this.setState({hover: true})} 
            onMouseLeave={() => this.setState({hover: false})}
        >
          <Link to={`/restaurants/${data.url}`}>
            <img className={styles.rstImg} src={data.yelp_image} />
          </Link>
        </div>
        <div className={styles.rstCardBottom}>
          <div className={styles.rstInfo}>
            <div className={styles.rstInfoTop}>
                <Rating rating={data.rating} />
                <Tooltip title="Go To Restaurant Page" placement="top">
                    <Link to={`/restaurants/${data.url}`} className={styles.rstInfoName}>
                      <Typography variant="h6" noWrap>
                        {data.name}
                      </Typography>
                    </Link>
                </Tooltip>
            </div>  
            <div>
                <IconButton style={{color: "rgba(10,10,10, .95)"}} edge="end" onClick={this.handleMenuClick}>
                    <MoreVertIcon/>
                </IconButton>
                <Menu 
                    anchorEl={this.state.anchor} 
                    open={this.state.anchor} 
                    onClose={this.handleMenuClose}
                >
                    <MenuItem onClick={(e) => {this.handlePreview(); this.handleMenuClose(e);}}>
                        <ListItemIcon>
                            <ZoomInIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <Typography variant="body2" noWrap>
                            Preview Option
                        </Typography>
                    </MenuItem>
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={data.yelp_url}
                    >
                        <MenuItem onClick={this.handleMenuClose}>
                            
                            <ListItemIcon>
                                <LaunchIcon color="primary" fontSize="small" />
                            </ListItemIcon>
                            <Typography variant="body2" noWrap>
                                Go to Yelp Page
                            </Typography>
                            
                        </MenuItem>
                    </a>
                    {(isNotChosen && this.props.isUserMember) &&
                        <MenuItem onClick={(e) => {this.handleDeleteOption(); this.handleMenuClose(e);}}>
                            <ListItemIcon>
                                <CloseIcon color="secondary" fontSize="small" />
                            </ListItemIcon>
                            <Typography variant="body2" noWrap>
                                Delete Option
                            </Typography>
                        </MenuItem>
                    }
                </Menu>
            </div>
          </div>
          <div className={styles.rstCategories}>
            {data.price} &#8226;
            {data.categories.map((rc) => (
              <div key={rc.category.id} className={styles.categoryChip}>
                <Avatar
                  style={{ width: 20, height: 20 }}
                  variant="square"
                  src={`${process.env.REACT_APP_S3_STATIC_URL}${rc.category.api_label}.png`}
                >
                  <img
                    style={{ width: 20, height: 20 }}
                    alt={"&#9787;"}
                    src={`https://meetup-static.s3-us-west-1.amazonaws.com/static/general/panda.png`}
                  />
                </Avatar>
                {rc.category.label}
              </div>
            ))}
          </div>
          {this.props.full && this.renderActions(status, scores, banned)}
        </div>
      </>
    );
  };

  render() {
    const data = this.props.option.restaurant;
    const banned = this.props.option.banned;

    return (
      <>
        {this.props.full ? 
          <div
            className={`${styles.rstWrapper} ${
              banned ? styles.banned : ""
            } ${this.state.hover ? "elevate-2" : "elevate"}`}
            id={`option-${this.props.optionId}`}
          >
            {this.renderRestauraunt(data, this.props.full)}
          </div>
          :
          <div className={`${styles.rstHorz} ${this.state.hover ? "elevate-2" : "elevate"}`} id={`option-${this.props.optionId}`}>
            {this.renderRestauraunt(data, this.props.full)}
            <div className={styles.restaurantHorzInfo}>
              <div className={styles.rstHorzInfoEntry}>
                <RoomIcon /> <span>{data.location}</span>
              </div>
              <div className={styles.rstHorzInfoEntry}>
                <PhoneIcon /> <span>{data.phone}</span>
              </div>
            </div>
          </div>
        }
        {this.state.preview && (
          <RestaurantPreview
            handleClose={this.handlePreview}
            identifier={data.identifier}
          />
        )}
      </>
    )
  }
}

MeetupEventOption.propTypes = {
  socket: PropTypes.object.isRequired,
  isUserMember: PropTypes.bool.isRequired,
  event: PropTypes.number.isRequired,
  meetup: PropTypes.string.isRequired,
  full: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  option: meetupEventOptionPropType,
  members: PropTypes.objectOf(meetupMemberPropType),
  user: userPropType,
};

function mapStateToProps(state, props) {
  return {
    option:
      state.meetup.meetups[props.meetup].events[props.event].options[
        props.optionId
      ],
    members: state.meetup.meetups[props.meetup].members,
    user: state.user.user,
  };
}

export default connect(mapStateToProps)(MeetupEventOption);
export { MeetupEventOption as UnderlyingMeetupEventOption };
