import React, { Component } from "react";
import { axiosClient } from "../../accounts/axiosClient";
import { Avatar, Button, Grow, BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { getPreferences } from "../../actions";
import {Category as CategoryIcon, Info as InfoIcon} from '@material-ui/icons'
import { Link } from "react-router-dom";
import {connect} from 'react-redux'
import { Helmet } from "react-helmet";
import styles from "../../styles/category.module.css";
import meetupStyles from "../../styles/meetup.module.css";

class Categories extends Component {
  constructor(props) {
    super(props);
    this.state = {
      category: "",
      popular: [],
      random: [],
      popularCategoriesLoaded: false,
      randomCategoriesLoaded: false,
      isMobile: window.matchMedia("(max-width: 768px)").matches,
      mobileTabIndex: 0
    };
  }

  async componentDidMount() {
    const handler = (e) => this.setState({ isMobile: e.matches });
    window.matchMedia("(max-width: 768px)").addListener(handler);
    const [popular, random] = await Promise.all([
      axiosClient.get(`/api/categories/?type=popular`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }),
      axiosClient.get(`/api/categories/?type=random`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }),
      this.props.getPreferences(this.props.user.id)
    ]);
    this.setState({
      popular: popular.data.categories,
      random: random.data.categories,
      popularCategoriesLoaded: true,
      randomCategoriesLoaded: true,
    });
  }

  handleReload = async () => {
    this.setState({ randomCategoriesLoaded: false });

    const response = await axiosClient.get(`/api/categories/?type=random`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    this.setState({
      random: response.data.categories,
      randomCategoriesLoaded: true,
    });
  };

  handleMobileTabChange = (e, newValue) => {
    this.setState({mobileTabIndex: newValue})
  }

  render() {

    const renderPreset = () => {
      return (
        <div className={meetupStyles.preset}>
          {this.props.preferences.map((pref, index) => (
            <Link to={`/categories/${pref.category.api_label}`}>
              <div
                key={pref.id}
                className={`${meetupStyles.presetCategory} elevate-0`}
              >
                <Avatar
                  variant="square"
                  src={`${process.env.REACT_APP_S3_STATIC_URL}${pref.category.api_label}.png`}
                />
                <span>{pref.category.label}</span>
              </div>
            </Link>
          ))}
        </div>
      );
    };

    return (
      <div className={`innerWrap  ${this.state.isMobile ? "innerWrap-mobile": ""}`}>
        <Helmet>
          <meta charSet="utf-8" />
          <meta name="description" content="Discover new categories." />
          <title>Categories</title>
        </Helmet>
        <div className={`innerLeft ${this.state.isMobile ? "innerLeft-mobile": ""} ${this.state.mobileTabIndex === 0 ? "innerLeft-show" : ""}`}>
          <div className="innerLeftHeader">
            Categories
          </div>
          <div className="innerLeftHeaderBlock">
            <div className="hr">Actions</div>
            <div className="innerLeftHeaderBlockAction">
              <div className="blockActionHeader">
                Discover Categories
                <Button onClick={this.handleReload} color="primary" size="small" variant="contained">
                  Refresh
                </Button>
              </div>
            </div>
          </div>
          <div className="innerLeftHeaderBlock">
            <div className="hr">Preferences</div>
            <div className={styles.preferences}>
              {renderPreset()}
            </div>
            
          </div>
        </div>
        <div className={`innerRight ${this.state.isMobile ? "innerRight-mobile": ""} ${this.state.mobileTabIndex === 0 ? "" : "innerRight-show"}`}>
          <div className="innerRightBlock">
            <div className="innerRightBlockHeader">
              <div className="hr">Most Popular</div>
              <div className={styles.entries}>
                {this.state.popularCategoriesLoaded
                  ? this.state.popular.map((popular, index) => (
                      <Grow
                        key={popular.id}
                        in={true}
                        timeout={Math.max((index + 1) * 70)}
                      >
                        <Link to={`/categories/${popular.api_label}`}>
                          <div className={styles.entry}>
                            <Avatar
                              src={`${process.env.REACT_APP_S3_STATIC_URL}${popular.api_label}.png`}
                              variant="square"
                            />{" "}
                            {popular.label}
                          </div>
                        </Link>
                      </Grow>
                    ))
                  : [...Array(12).keys()].map((num) => (
                      <div key={num} className={styles.placeholder}>
                        <Skeleton
                          animation="wave"
                          variant="circle"
                          height={40}
                          width={40}
                        />
                        <Skeleton
                          animation="wave"
                          height={10}
                          width={60}
                          style={{ marginLeft: 10 }}
                        />
                      </div>
                    ))}
              </div>
            </div>
          </div>
          <div className="innerRightBlock">
            <div className="innerRightBlockHeader">
              <div className="hr">Discover Categories</div>
              <div className={styles.entries}>
                {this.state.randomCategoriesLoaded
                  ? this.state.random.map((random, index) => (
                      <Grow
                        key={random.id}
                        in={true}
                        timeout={Math.max((index + 1) * 70)}
                      >
                        <Link to={`/categories/${random.api_label}`}>
                          <div className={styles.entry}>
                            <Avatar
                              src={`${process.env.REACT_APP_S3_STATIC_URL}${random.api_label}.png`}
                              variant="square"
                            />{" "}
                            {random.label}
                          </div>
                        </Link>
                      </Grow>
                    ))
                  : [...Array(24).keys()].map((num) => (
                      <div key={num} className={styles.placeholder}>
                        <Skeleton
                          animation="wave"
                          variant="circle"
                          height={40}
                          width={40}
                        />
                        <Skeleton
                          animation="wave"
                          height={10}
                          width={60}
                          style={{ marginLeft: 10 }}
                        />
                      </div>
                    ))}
              </div>
            </div>
          </div>
        </div>
        {this.state.isMobile && 
            <div className="innerWrap-mobileControl">
              <BottomNavigation value={this.state.mobileTabIndex} onChange={this.handleMobileTabChange} showLabels>
                  <BottomNavigationAction label="Info" icon={<InfoIcon/>}/>
                  <BottomNavigationAction label="Categories" icon={<CategoryIcon/>}/>
              </BottomNavigation>
            </div>
          }
      </div>
    );
  }
}

Categories.propTypes = {};

const mapDispatchToProps = {
  getPreferences
}

const mapStateToProps = state => {
  return {
    preferences: state.user.preferences,
    user: state.user.user
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Categories);
