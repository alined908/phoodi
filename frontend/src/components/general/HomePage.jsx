import React, { Component } from "react";
import "../../styles/home.css";
import { Button, IconButton } from "@material-ui/core";
import { Link } from "react-router-dom";
import { ReactComponent as ClockIcon } from "../../assets/svgs/clock.svg";
import { ReactComponent as HavingFunIcon } from "../../assets/svgs/undraw_fun.svg";
import { ReactComponent as StreetFoodIcon } from "../../assets/svgs/undraw_foodtruck.svg";
import { ReactComponent as OnlineFriendsIcon } from "../../assets/svgs/undraw_chat.svg";
import { ReactComponent as TastingIcon } from "../../assets/svgs/undraw_eattogether.svg";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import throttle from "lodash/throttle";
import { Helmet } from "react-helmet";
import {SearchBar} from '../components'

class HomePage extends Component {

  constructor(props){
    super(props);
    this.topRef = React.createRef()
    this.handleScrollWrapper = this.handleScrollWrapper.bind(this);
    this.delayedCallback = throttle(this.handleScroll, 200);
  }

  componentDidMount(){
    let navBar = document.getElementById('nav')
    navBar.style.transition = 'none'
    navBar.style.boxShadow = "none"
    navBar.style.color = "white"
    navBar.style.background = 'transparent'
  }

  componentWillUnmount(){
    let navBar = document.getElementById('nav')
    navBar.style.transition = 'none'
    navBar.style.boxShadow = "var(--shadow-1)"
    navBar.style.color = "black"
    navBar.style.background = 'white'
  }

  handleScroll(e) {
    const top = e.target.children[0]
    const bounding = top.getBoundingClientRect()
    let navBar = document.getElementById('nav')

    // If bottom of home not visible
    if (Math.abs(bounding.top) >= bounding.height) {
      navBar.style.boxShadow = "var(--shadow-1)"
      navBar.style.color = "black"
      navBar.style.background = 'white'
      navBar.style.transition = 'all .2s ease'
    } else{
      navBar.style.boxShadow = "none"
      navBar.style.color = "white"
      navBar.style.background = 'transparent'
      navBar.style.transition = 'all .2s ease'
    }
  }

  handleScrollWrapper = (event) => {
    event.persist();
    this.delayedCallback(event);
  };

  handleFastScroll = () => {
    const middle = document.querySelector(".middle");
    middle.scrollIntoView({ behavior: "smooth" });
  };

  render() {
    const image = `${process.env.REACT_APP_S3_STATIC_URL}/static/general/home.jpg`

    return (
      <div className="home" ref={this.topRef} onScroll={this.handleScrollWrapper}>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Phoodi</title>
          <meta name="description" content="Phoodi Home Page" />
        </Helmet>
        <div className="top">
          <div className="hero-image" style={{backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${image})`}}>
            <div className="hero-text">
              Phoodi
              <div className="hero-text-small">
                Focusing on the foodie experience.
              </div>
            </div>
            <div className="search">
              <SearchBar/>
            </div>
          </div>
          <div className="scrollbot" onClick={this.handleFastScroll}>
            <IconButton>
              <KeyboardArrowDownIcon color="inherit" size="large" />
            </IconButton>
          </div>
        </div>
        <div className="middle">
          <div className="middle-header">
            <ClockIcon className="svg-shadow" width={50} height="100%" />
            <div className="section-title">
              Get food with friends faster
            </div>
            <div className="section-text">
              Schedule events. Choose from options. Meetup!
            </div>
          </div>
          <div className="middle-entry left">
            <div className="middle-entry-img">
              <HavingFunIcon className="svg-shadow" width="100%" height="100%" />
            </div>
            <div className="middle-entry-text">
              <div className="section-title">
                Find Nearby Foodies
              </div>
              <div className="section-text">
                Bond with friends and people with similar food tastes near you
              </div>
            </div>
          </div>
          <div className="middle-entry right">
            <div className="middle-entry-text">
              <div className="section-title">
                Schedule Group Meetups
              </div>
              <div className="section-text">
                Create multiple events and instantly add them to your calendar
              </div>
            </div>
            <div className="middle-entry-img">
              <TastingIcon className="svg-shadow" width="100%" height="100%" />
            </div>
          </div>
          <div className="middle-entry left">
            <div className="middle-entry-img">
              <StreetFoodIcon className="svg-shadow" width="100%" height="100%" />
            </div>
            <div className="middle-entry-text">
              <div className="section-title">
                Explore New Foods
              </div>
              <div className="section-text">
                See what tastes good in your area
              </div>
            </div>
          </div>
          <div className="middle-entry right">
            <div className="middle-entry-text">
              <div className="section-title">
                Chat With Friends
              </div>
              <div className="section-text">
                Talk about what you've been craving
              </div>
            </div>
            <div className="middle-entry-img">
              <OnlineFriendsIcon className="svg-shadow" width="100%" height="100%" />
            </div>
          </div>
        </div>
        {!this.props.authenticated && <div className="bottom">
          <div className="bottom-button">
            <Link to="/register">
              <Button
                style={{ padding: "1rem" }}
                variant="contained"
                color="primary"
              >
                Start Exploring
              </Button>
            </Link>
          </div>
        </div>
        }
      </div>
    );
  }
}

export default HomePage;
