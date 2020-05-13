import React, { Component } from "react";
import { axiosClient } from "../../accounts/axiosClient";
import { Avatar, Tooltip, IconButton, Grid, Grow, Slider, CircularProgress,  BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import {
  getMeetups,
  getFriends,
  addPreference,
  deletePreference,
} from "../../actions";
import { Friend, MeetupCard, RestaurantCard } from "../components";
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  People as PeopleIcon,
  Info as InfoIcon,
} from "@material-ui/icons";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { userPropType } from "../../constants/prop-types";
import { Helmet } from "react-helmet";
import { history } from "../MeetupApp";
import moment from "moment";
import styles from "../../styles/category.module.css";

const marks = [
  { value: 5 },
  { value: 10 },
  { value: 15 },
  { value: 20 },
  { value: 25 },
];

class Category extends Component {
  constructor(props) {
    super(props);
    this.state = {
      category: {},
      isRestaurantsFetching: false,
      restaurants: [],
      loadingError: false,
      liked: false,
      numLiked: 0,
      radius: props.user.settings.radius,
      isMobile: window.matchMedia("(max-width: 768px)").matches,
      mobileTabIndex: 0
    };
  }

  componentDidMount() {
    const handler = (e) => this.setState({ isMobile: e.matches });
    window.matchMedia("(max-width: 768px)").addListener(handler);
    //Get Information and redirect if invalid category
    this.getInformation();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.match.params.api_label !== prevProps.match.params.api_label
    ) {
      this.getInformation();
    }
  }

  getInformation = async () => {
    try {
      const [category, restaurants] = await Promise.all([
        axiosClient.get(
          `/api/categories/${this.props.match.params.api_label}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        this.handleGetRestaurants(),
        this.props.getFriends(
          this.props.user.id,
          this.props.match.params.api_label
        ),
        this.handleGetMeetups()
      ]);
      this.setState({
        isRestaurantsFetching: false,
        category: category.data,
        categoryLoaded: true,
        liked: category.data.preference !== null,
        numLiked: category.data.num_liked,
        restaurants: restaurants.data,
      });
    } catch (e) {
      history.push("/404");
    }
  };

  handleLike = async (isLike) => {
    isLike
      ? await this.props.addPreference(
          { category_id: this.state.category.id },
          this.props.user.id
        )
      : await this.props.deletePreference(
          this.props.user.id,
          this.state.category.id
        );
    isLike
      ? await this.setState({ liked: true, numLiked: this.state.numLiked + 1 })
      : await this.setState({
          liked: false,
          numLiked: this.state.numLiked - 1,
        });
  };

  handleGetRestaurants = async() => {
    this.setState({isRestaurantsFetching: true})
    const response = await axiosClient.request({
      method: "GET",
      url: `/api/restaurants/`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      params: {
        categories: this.props.match.params.api_label,
        latitude: this.props.user.settings.latitude,
        longitude: this.props.user.settings.longitude,
        radius: this.state.radius,
      },
    })
    return response
  }

  handleGetMeetups = () => {
    this.props.getMeetups({
      type: "public",
      startDate: moment().format("YYYY-MM-DD"),
      endDate: moment().add(7, "d").format("YYYY-MM-DD"),
      categories: this.props.match.params.api_label,
      coords: { ...this.props.user.settings, radius: this.state.radius },
    });
  }

  handleSettingsChange = async() => {
    this.setState({isRestaurantsFetching: true})
    await Promise.all([this.handleGetRestaurants(), this.handleGetMeetups()])
    this.setState({isRestaurantsFetching: false})
  }

  handleMobileTabChange = (e, newValue) => {
    this.setState({mobileTabIndex: newValue})
  }

  render() {
    const category = this.state.category;
    return (
      <div className={`innerWrap  ${this.state.isMobile ? "innerWrap-mobile": ""}`}>
        <Helmet>
          <meta charSet="utf-8" />
          <meta name="description" content="Discover new categories." />
          <title>{`${
            category.label === undefined ? "" : category.label
          }`}</title>
        </Helmet>
        <div className={`innerLeft ${this.state.isMobile ? "innerLeft-mobile": ""} ${this.state.mobileTabIndex === 0 ? "innerLeft-show" : ""}`}>
          <div className="innerLeftHeader">
            <span className={styles.avatar}>
              <Avatar
                variant="square"
                src={`${process.env.REACT_APP_S3_STATIC_URL}${category.api_label}.png`}
              />
            </span>
            <span>{category.label}</span>
            <div className={styles.actions}>
              {this.state.liked ? (
                <Tooltip title="Remove Like">
                  <IconButton
                    color="secondary"
                    onClick={() => this.handleLike(false)}
                  >
                    <FavoriteIcon/>
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Like">
                  <IconButton onClick={() => this.handleLike(true)}>
                    <FavoriteBorderIcon />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </div>
          <div className="innerLeftHeaderBlock">
            <div className="hr">
                Statistics
            </div>
            <div className={`${styles.categoryStats} elevate-0`}>
              <span>Likes <span className="blockActionChip">{this.state.numLiked}</span> </span>
              <span>Events <span className="blockActionChip">{this.state.numLiked}</span> </span>
              <span>Restaurants <span className="blockActionChip">{this.state.numLiked}</span> </span>
            </div>
          </div>
          <div className="innerLeftHeaderBlock">
            <div className="hr">
                Settings
            </div>
            <div className="innerLeftHeaderBlockAction">
              <div className="blockActionHeader">
                Radius
              </div>
              <div className="blockActionContent">
                  <Slider
                    valueLabelDisplay="off"
                    step={5}
                    marks={marks}
                    value={this.state.radius}
                    min={5}
                    max={25}
                    onChange={(e, val) => this.setState({radius: val})}
                    onChangeCommitted={(e, val) => this.handleSettingsChange()}
                  />
                <div className="blockActionChip" style={{marginLeft: 10}}>
                  {`${this.state.radius} miles`}
                </div>
              </div>
            </div>
            <div className="innerLeftHeaderBlockAction">
              <div className="blockActionHeader">
                  Price
              </div>
            </div>
          </div>
          <div className="innerLeftHeaderBlock">
            <div className="hr">
                Mutual Friends
            </div>
            <div className={`${styles.friends} elevate-0`}>
                {this.props.friends.map((friend) => (
                  <Friend
                    key={friend.id}
                    isUserFriend={true}
                    friend={friend}
                  />
                ))}
            </div>
          </div>
        </div>
        <div className={`innerRight ${this.state.isMobile ? "innerRight-mobile": ""} ${this.state.mobileTabIndex === 0 ? "" : "innerRight-show"}`}>
          <div className="innerRightBlock">
            <div className="innerRightBlockHeader">
              <div className="hr" style={{fontSize: ".9rem"}}>
                  Restaurants Near You
              </div>
            </div>
            {this.state.isRestaurantsFetching && 
              <div className="loading">
                <CircularProgress size={30}/>
              </div>
            }
            {!this.state.isRestaurantsFetching && 
              <Grid container justify="space-evenly" spacing={1}>
                {this.state.restaurants.map((rst) => (
                  <RestaurantCard data={rst}/>
                ))}
              </Grid>
            }
          </div>
          <div className="innerRightBlock">
              <div className="innerRightBlockHeader">
                <div className="hr" style={{fontSize: ".9rem"}}>
                  Meetups Near You
                </div>
              </div>
              {this.props.isMeetupsFetching && 
                <div className="loading"> 
                  <CircularProgress size={30}/>
                </div>
              
              }
              {this.props.isMeetupsInitialized && 
                <Grid container justify="space-evenly" spacing={1}>
                  {Object.keys(this.props.meetups).map((uri, index) => (
                    <Grid key={this.props.meetups[uri].id} item xs={12} lg={4}>
                      <Grow in={true} timeout={Math.max((index + 1) * 200, 500)}>
                        <div className="meetups-cardwrapper">
                          <MeetupCard meetup={this.props.meetups[uri]} />
                        </div>
                      </Grow>
                    </Grid>
                  ))}
                </Grid>
              }
            </div>
          <div>
        </div>
        </div>
        {this.state.isMobile && 
            <div className="innerWrap-mobileControl">
              <BottomNavigation value={this.state.mobileTabIndex} onChange={this.handleMobileTabChange} showLabels>
                  <BottomNavigationAction label="Info" icon={<InfoIcon/>}/>
                  <BottomNavigationAction label="Activities" icon={<PeopleIcon/>}/>
              </BottomNavigation>
            </div>
          }
      </div>
    );
  }
}

Category.propTypes = {
  user: userPropType,
  addPreference: PropTypes.func.isRequired,
  deletePreference: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      api_label: PropTypes.string.isRequired,
    }),
  }),
};

function mapStateToProps(state) {
  return {
    user: state.user.user,
    meetups: state.meetup.meetups,
    isMeetupsFetching: state.meetup.isMeetupsFetching,
    isMeetupsInitialized: state.meetup.isMeetupsInitialized,
    friends: state.user.friends,
  };
}

const mapDispatchToProps = {
  addPreference,
  deletePreference,
  getMeetups,
  getFriends,
};

export default connect(mapStateToProps, mapDispatchToProps)(Category);
