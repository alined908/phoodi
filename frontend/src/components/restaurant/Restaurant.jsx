import React, { Component } from "react";
import { axiosClient } from "../../accounts/axiosClient";
import { RestaurantThread, Map, Rating, RestaurantReviewForm } from "../components";
import { history } from "../MeetupApp";
import {Info as InfoIcon, Create as CreateIcon, Comment as CommentIcon} from '@material-ui/icons'
import {Tooltip, Avatar, Button, BottomNavigation, BottomNavigationAction, Fab} from '@material-ui/core'
import styles from "../../styles/meetup.module.css";

class Restaurant extends Component {
  constructor(props) {
    super(props);
    this.state = {
      restaurant: null,
      reviews: [],
      showReviewForm: false,
      isMobile: window.matchMedia("(max-width: 768px)").matches,
      mobileTabIndex: 0
    };
  }

  async componentDidMount() {
    const handler = (e) => this.setState({ isMobile: e.matches });
    window.matchMedia("(max-width: 768px)").addListener(handler);
    try {
      const [restaurant, reviews] = await Promise.all([
        axiosClient.get(
        `/api/restaurants/${this.props.match.params.uri}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, 
            },
          }
        ),
        axiosClient.get(
          `/api/restaurants/${this.props.match.params.uri}/reviews/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
      ])

      this.setState({ restaurant: restaurant.data, reviews: reviews.data });
    } catch (e) {
      history.push("/404");
    }
  }

  displayOnSuccess = (review) => {
    this.setState({ reviews: [review, ...this.state.reviews] });
  };

  openFormModal = () => {
    this.setState({ reviewForm: !this.state.reviewForm });
  };

  handleMobileTabChange = (e, newValue) => {
    this.setState({mobileTabIndex: newValue})
  }

  render() {
    const rst = this.state.restaurant;
 
    return (
      <div className={`innerWrap  ${this.state.isMobile ? "innerWrap-mobile": ""}`}>
        {rst && <div className={`innerLeft ${this.state.isMobile ? "innerLeft-mobile": ""} ${this.state.mobileTabIndex === 0 ? "innerLeft-show" : ""}`}>
          <div className="innerLeftHeader">
              {rst.name}
              <Rating rating={rst.rating}/>
            </div>
            {!this.state.isMobile &&
              <div className="innerLeftHeaderBlock">
                <div className="hr">Actions</div>
                <div className="innerLeftHeaderBlockAction">
                  <div className="blockActionContent">
                  <Button onClick={this.openFormModal} color="primary" size="small" variant="contained">
                    Add Review
                  </Button>
                  </div>
                </div>
            </div>
            }
            <div className="innerLeftHeaderBlock">
              <div className="hr">Statistics</div>
              <div className="innerLeftHeaderBlockAction">
                <div className="blockActionContent" style={{justifyContent: "space-around"}}>
                  <span>Likes <span className="blockActionChip">{rst.option_count}</span> </span>
                  <span>Options <span className="blockActionChip">{rst.option_count}</span> </span>
                  <span>Reviews <span className="blockActionChip">{rst.review_count}</span> </span>
                </div>
              </div>
           </div>
            <div className="innerLeftHeaderBlock">
              <div className="hr">Information</div>
              <div className="innerLeftHeaderBlockAction">
                <div className="blockActionHeader">
                  Categories
                </div>
                <div className="blockActionContent" style={{flexWrap: "wrap"}}>
                  {rst.categories.map((item) => 
                      <span className="blockActionChip" style={{display: "flex", alignItems: "center"}}>
                          <Avatar
                            variant="square"
                            src={`${process.env.REACT_APP_S3_STATIC_URL}${item.category.api_label}.png`}
                          />
                          {item.category.label}
                      </span>
                  )}
                </div>
              </div>
              <div className="innerLeftHeaderBlockAction">
                <div className="blockActionHeader">
                  Price
                  <span className="blockActionChip" style={{minWidth: 0}}>
                    {rst.price}
                  </span>
                </div>
              </div>
              <div className="innerLeftHeaderBlockAction">
                <div className="blockActionHeader">
                  Phone 
                  <span className="blockActionChip">
                    {rst.phone}
                  </span>
                </div>
              </div>
              <div className="innerLeftHeaderBlockAction">
                <div className="blockActionHeader">
                  Location 
                  <Tooltip title={rst.location}>
                    <span className="blockActionChip">
                      {rst.location}
                    </span>
                  </Tooltip>
                </div>
              </div>
              <div className={styles.rstMap} style={this.state.isMobile ? {height: 350} : {}}>
                  <Map
                    location={{
                      latitude: rst.latitude,
                      longitude: rst.longitude,
                    }}
                    notLoad
                  />
                </div>
            </div>
        </div> 
        }
        <div className={`innerRight ${this.state.isMobile ? "innerRight-mobile": ""} ${this.state.mobileTabIndex === 0 ? "" : "innerRight-show"}`}>
          <div className="innerRightBlock">

              <RestaurantThread
                restaurant={rst}
                reviews={this.state.reviews}
              />
          </div>
        </div>
        {this.state.reviewForm && (
          <RestaurantReviewForm
            restaurant={rst}
            displayOnSuccess={this.displayOnSuccess}
            handleClose={this.openFormModal}
          />
        )}
        {this.state.isMobile && 
          <div className="innerWrap-mobileControl">
            <BottomNavigation value={this.state.mobileTabIndex} onChange={this.handleMobileTabChange} showLabels>
                <BottomNavigationAction label="Info" icon={<InfoIcon/>}/>
                <Fab
                  className="mobileControl-Fab"
                  color="primary"
                  size="medium"
                  onClick={this.openFormModal}
                >
                    <CreateIcon/>
                </Fab>
                <BottomNavigationAction label="Reviews" icon={<CommentIcon/>}/>
            </BottomNavigation>
          </div>
        }
      </div>
    );
  }
}

export default Restaurant;
