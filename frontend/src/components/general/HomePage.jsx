import React, { Component } from "react";
import "../../styles/home.css";
import { Button, IconButton } from "@material-ui/core";
import { Link } from "react-router-dom";
import { ReactComponent as IceCreamIcon } from "../../assets/svgs/ice-cream.svg";
import { ReactComponent as CandyAppleIcon } from "../../assets/svgs/food-and-restaurant.svg";
import { ReactComponent as PuddingIcon } from "../../assets/svgs/chocolate.svg";
import { ReactComponent as ChocolateIcon } from "../../assets/svgs/chocolate2.svg";
import { ReactComponent as CupCakeIcon } from "../../assets/svgs/cupcake.svg";
import { ReactComponent as ClockIcon } from "../../assets/svgs/clock.svg";
import { ReactComponent as WheelIcon } from "../../assets/svgs/wheel.svg";
import { ReactComponent as HavingFunIcon } from "../../assets/svgs/undraw_fun.svg";
import { ReactComponent as StreetFoodIcon } from "../../assets/svgs/undraw_foodtruck.svg";
import { ReactComponent as OnlineFriendsIcon } from "../../assets/svgs/undraw_chat.svg";
import { ReactComponent as TastingIcon } from "../../assets/svgs/undraw_eattogether.svg";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import { Helmet } from "react-helmet";

class HomePage extends Component {
  handleScroll = () => {
    const middle = document.querySelector(".middle");
    middle.scrollIntoView({ behavior: "smooth" });
  };

  render() {
    const food = () => {
      return (
        <div className="food-belt">
          <div className="food">
            <IceCreamIcon className={"cupcake svg-1"} height={50} width={50} />
            <CandyAppleIcon
              className={"cupcake svg-2"}
              height={50}
              width={50}
            />
            <PuddingIcon className={"cupcake svg-3"} height={50} width={50} />
            <ChocolateIcon className={"cupcake svg-4"} height={50} width={50} />
            <CupCakeIcon className={"cupcake svg-5"} height={50} width={50} />
          </div>
          <div className="belt">
            <WheelIcon className={"wheel"}></WheelIcon>
          </div>
        </div>
      );
    };

    return (
      <div className="home">
        <Helmet>
          <meta charSet="utf-8" />
          <title>Phoodie</title>
          <meta name="description" content="Phoodie Home Page" />
        </Helmet>
        <div className="top">
          {food()}
          <div className="scrollbot" onClick={this.handleScroll}>
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
        <div className="bottom">
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
      </div>
    );
  }
}

export default HomePage;
