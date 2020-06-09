import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Avatar,
  makeStyles
} from "@material-ui/core";
import axios from "axios";
import styles from "../../styles/meetup.module.css";
import { StaticMap, Rating  } from "../components";
import PropTypes from "prop-types";
// import {Skeleton } from "@material-ui/lab";
import moment from "moment";

const useStyles = makeStyles({
  dialog: {
    padding: "0 !important"
  },
});

const RestaurantPreview = (props) => {
  const [fetching, setFetching] = useState(true);
  const [info, setInfo] = useState({});
  const [reviews, setReviews] = useState({});
  const [error, setError] = useState(false);
  const classes = useStyles()

  useEffect(() => {
    (async () => {
      await Promise.all([
        axios.request({
          method: "GET",
          url: `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/${props.identifier}`,
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_YELP_API_KEY}`,
          },
        }),
        axios.request({
          method: "GET",
          url: `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/${props.identifier}/reviews`,
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_YELP_API_KEY}`,
          },
        }),
      ])
        .then(([details, comments]) => {
          console.log(details.data);
          console.log(comments.data);
          setInfo(details.data);
          setReviews(comments.data);
        })
        .catch(([detailsError, commentsError]) => {
          setError(true);
          console.log(detailsError);
          console.log(commentsError);
        });

      setFetching(false);
    })();
  }, []);

  return (
    <Dialog open={true} onClose={props.handleClose} maxWidth="lg" fullWidth={true}>
      <DialogContent className={classes.dialog}>
        {!fetching && (
          <div className={styles.rstPreview}>
            <div className={styles.rstPreviewInfo}>
              <div className={styles.photos}>
                {info.photos.map((photo) => (
                  <img alt={info.name} className={styles.photo} src={photo} />
                ))}
              </div>
              <div className={styles.rstPreviewInfoBottom}>
                <div className={styles.previewTitle}>
                  {info.name}
                  <Rating rating={info.rating} />
                </div>
                <div className={styles.previewInfo}>
                  <div className={styles.previewInfoLeft}>
                    <span>{info.price}</span>
                    <span>{info.display_phone}</span>
                    <span>{info.location.display_address.join(" ")}</span>
                  </div>
                  <div className={styles.previewInfoRight}>
                    {info.hours[0].is_open_now ? "Open Now!" : "Closed Now"}
                    {info.hours[0].open.map((day) => (
                      <div>
                        {day.start} - {day.end}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.reviews}>
                  <div>3 Reviews</div>
                  {reviews.reviews.map((review) => (
                    <div className={styles.review}>
                      <Avatar src={review.user.image_url}>
                        {review.user.name.charAt(0)}
                      </Avatar>
                      <div className={styles.reviewInner}>
                        <div className={styles.reviewInfo}>
                          <div className={styles.reviewUser}>
                            {review.user.name}
                          </div>
                          <div className={styles.reviewDate}>
                            {moment(review.time_created).calendar()}
                          </div>
                        </div>
                        <div className={styles.reviewComment}>
                          {review.text}
                        </div>
                      </div>
                      <Rating rating={review.rating * 2}/>
                    </div>
                  ))}
                </div>
              </div>
          </div>
          <div className={styles.rstMapWrapper}>
            <StaticMap
              location={{
                latitude: info.coordinates.latitude,
                longitude: info.coordinates.longitude,
              }}
            />
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

RestaurantPreview.propTypes = {
  handleClose: PropTypes.func.isRequired,
  identifier: PropTypes.string.isRequired,
};

export default RestaurantPreview;
