import React, { Component } from "react";
import { axiosClient } from "../../accounts/axiosClient";
import { RestaurantThread, StaticMap, Rating, RestaurantReviewForm } from "../components";
import { history } from "../MeetupApp";
import {Info as InfoIcon, Create as CreateIcon, Comment as CommentIcon} from '@material-ui/icons'
import {Tooltip, Avatar, Button, BottomNavigation, BottomNavigationAction, Fab} from '@material-ui/core'
import styles from '../../styles/restaurant.module.css';
import {connect} from 'react-redux'

const prices = {
  1: '$',
  2: '$$',
  3: '$$$',
  4: '$$$$'
}

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
                <div className={styles.rstContact}>
                  <div>
                    {rst.phone}
                  </div>
                  <div>
                    {rst.location}
                  </div>
                </div>   
                <div className={styles.rstStats}>
                  <span>Likes {rst.option_count}</span> 
                  <span>Options {rst.option_count}</span> 
                </div>        
                {rst.categories && rst.categories.map((item) => 
                  <span className={styles.rstCategory} style={{display: "flex", alignItems: "center"}}>
                      <Avatar
                        variant="square"
                        src={`${process.env.REACT_APP_S3_STATIC_URL}/static/category/${item.category.api_label}.png`}
                      />
                      {item.category.label}
                  </span>
                )}
                <span >
                  {prices[rst.price]}
                </span>

                <div className={styles.rstMap} style={this.state.isMobile ? {height: 350} : {}}>
                    {rst.latitude && <StaticMap
                      location={{
                        latitude: rst.latitude,
                        longitude: rst.longitude,
                      }}
                      notLoad
                    />
                    }
                </div>
              </div>
            </div>
            <div className={styles.rstReviewsSection}>
              <div className={styles.rstReviewsHeader}>
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
          <div>
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
