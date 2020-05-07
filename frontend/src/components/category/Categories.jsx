import React, { Component } from "react";
import { axiosClient } from "../../accounts/axiosClient";
import { Avatar, Button, Grow } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { getPreferences } from "../../actions";
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
    };
  }

  async componentDidMount() {
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
      <div className="innerWrap">
        <Helmet>
          <meta charSet="utf-8" />
          <meta name="description" content="Discover new categories." />
          <title>Categories</title>
        </Helmet>
        <div className="innerLeft">
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
        <div className="innerRight">
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
                        <Link to={`/category/${random.api_label}`}>
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
