import React, { Component } from "react";
import { axiosClient } from "../../accounts/axiosClient";
import { Avatar, IconButton, Tooltip, Grow } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import CachedIcon from "@material-ui/icons/Cached";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import styles from "../../styles/category.module.css";

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
    return (
      <div className={styles.section}>
        <Helmet>
          <meta charSet="utf-8" />
          <meta name="description" content="Discover new categories." />
          <title>Categories</title>
        </Helmet>
        <div className={styles.container}>
          <div className={styles.description}>Most Popular Categories</div>
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
        <div className={styles.container}>
          <div className={styles.description}>
            Discover New Categories
            <Tooltip title="Reload">
              <IconButton onClick={this.handleReload} color="primary">
                <CachedIcon></CachedIcon>
              </IconButton>
            </Tooltip>
          </div>
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
    );
  }
}

Categories.propTypes = {};

export default Categories;
