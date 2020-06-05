import React, { Component } from "react";
import { axiosClient } from "../../accounts/axiosClient";
import { RestaurantThread, StaticMap, Rating, RestaurantReviewForm } from "../components";
import { history } from "../MeetupApp";
import {Info as InfoIcon, Create as CreateIcon, Comment as CommentIcon} from '@material-ui/icons'
import {Tooltip, Avatar, Button, BottomNavigation, BottomNavigationAction, Fab, CircularProgress} from '@material-ui/core'
import styles from '../../styles/restaurant.module.css';
import {connect} from 'react-redux'

const prices = {
  1: '$',
  2: '$$',
  3: '$$$',
  4: '$$$$'
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

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
    this.callApi()
  }

  componentDidUpdate(prevProps){
    if (prevProps.match.params.uri !== this.props.match.params.uri){
      this.setState({restaurant: null})
      this.callApi()
    }
  }

  callApi = async () => {
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
      console.log(restaurant.data)
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
      <div className={styles.rstWrapper}>
        {rst &&
          <div className={styles.rstImageShowcase}>
            <div className={styles.rstImageWrapper}>
              <div
                className={styles.rstImage}
                style={{backgroundImage: `url(${rst.yelp_image})`}}
              />
            </div>
            <div className={styles.rstImageWrapper}>
              <div
                className={styles.rstImage}
                style={{backgroundImage: `url(${rst.yelp_image})`}}
              />
            </div>
            <div className={styles.rstImageWrapper}>
              <div
                className={styles.rstImage}
                style={{backgroundImage: `url(${rst.yelp_image})`}}
              />
            </div>
          </div>
        }
        {rst ? 
          <div className={styles.rstInnerWrapper}>
            <div className={styles.rstInner}> 
              <div className={styles.rstInfo}>
                <div className={styles.rstName}>
                  {rst.name}
                  <Rating 
                    size="large"
                    rating={rst.rating}
                    readOnly={true}
                  />
                </div>
                <div className={styles.rstSecondHeader}>
                  <div className={styles.rstCategories}>       
                    {rst.categories && rst.categories.map((item) => 
                      <span className={styles.rstCategory} style={{display: "flex", alignItems: "center"}}>
                          <Avatar
                            className={styles.rstCategoryAvatar}
                            variant="square"
                            src={`${process.env.REACT_APP_S3_STATIC_URL}/static/category/${item.category.api_label}.png`}
                          />
                          {item.category.label}
                      </span>
                    )}
                    <span className={styles.rstPrice}>
                      {prices[rst.price]}
                    </span>
                  </div>
                  <div className={styles.rstStats}>
                    <span className={styles.rstStat}>{rst.review_count} Reviews</span>
                    <span className={styles.rstStat}>{rst.option_count} Likes </span> 
                    <span className={styles.rstStat}>{rst.option_count} Meetups </span> 
                  </div> 
                </div>
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                {`Contact & Hours`}
              </div>
              <div className={styles.rstMeta}>
                <div className={styles.rstMap}>
                  <StaticMap
                      location={{
                        latitude: rst.latitude,
                        longitude: rst.longitude,
                      }}
                      notLoad
                    />
                </div>
                <div className={styles.rstContact}>
                  <div>
                    <div className={styles.subHeader}>
                      Hours
                    </div>
                    <div className={styles.rstHours}>
                      {days.map((day) => 
                        <span className={styles.rstHour}>
                          <span className={styles.rstDay}>{day} </span>
                          {rst.hours[day].map((block) => 
                            <span>
                              {block}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className={styles.subHeader}>
                      Location
                    </div>
                    <div className={styles.rstLocation}>
                      <div>{rst.address1}</div> 
                      <div>{rst.city}, {rst.state}</div>
                    </div>
                  </div>
                  <div>
                    <div className={styles.subHeader}>
                      Phone
                    </div>
                    <div>
                      {rst.phone}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                Reviews({rst.review_count})
                <Button onClick={this.openFormModal} color="primary" variant="contained">
                  Add Review
                </Button>
              </div>
              <RestaurantThread
                authenticated={this.props.authenticated}
                restaurant={rst}
                reviews={this.state.reviews}
              />
            </div>
          </div>
          :
          <div className="loading">
            <CircularProgress size={30}/>
          </div>
        }
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
    )
  }
}

const mapStateToProps = state => {
  return {
    authenticated: state.user.authenticated
  }
}

export default connect(mapStateToProps)(Restaurant);
