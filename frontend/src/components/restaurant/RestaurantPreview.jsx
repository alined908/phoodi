import React, { useEffect, useState } from "react";
import {
  Dialog,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Tooltip,
  Avatar,
  Divider,
} from "@material-ui/core";
import axios from "axios";
import styles from "../../styles/meetup.module.css";
import { Map } from "../components";
import PropTypes from "prop-types";
import { Rating, Skeleton } from "@material-ui/lab";
import moment from "moment";

const RestaurantPreview = (props) => {
  const [fetching, setFetching] = useState(true);
  const [info, setInfo] = useState({});
  const [reviews, setReviews] = useState({});
  const [error, setError] = useState(false);

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
    <Dialog open={true} onClose={props.handleClose} maxWidth="md">
      <DialogTitle>
        {!fetching && (
          <div className={styles.previewTitle}>
            {info.name}
            <span className={styles.previewRating}>
              <span className={styles.ratingElement}>
                <Rating value={info.rating} readOnly />
              </span>
              <span className={styles.ratingElement}>
                ({info.review_count})
              </span>
            </span>
          </div>
        )}
      </DialogTitle>
      <DialogContent dividers>
        {!fetching && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <div className={styles.photos}>
                {info.photos.map((photo) => (
                  <img className={styles.photo} src={photo} />
                ))}
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className={styles.mapWrapper}>
                <Map
                  location={{
                    latitude: info.coordinates.latitude,
                    longitude: info.coordinates.longitude,
                  }}
                />
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className={styles.previewInfo}>
                <div>{info.display_phone}</div>
                <div>{info.location.display_address.join(" ")}</div>
                <div>{info.price}</div>
                <div>
                  {info.hours[0].is_open_now ? "Open Now!" : "Closed Now"}
                  {info.hours[0].open.map((day) => (
                    <div>
                      {day.start} - {day.end}
                    </div>
                  ))}
                </div>
              </div>
            </Grid>
            <Divider />
            <Grid item xs={12}>
              <div className={styles.reviews}>
                <div>3 Reviews</div>
                {reviews.reviews.map((review) => (
                  <div className={styles.review}>
                    <div className={styles.reviewUser}>
                      <Avatar src={review.user.image_url}>
                        {review.user.name.charAt(0)}
                      </Avatar>
                      {review.user.name}
                      <Rating value={review.rating} readOnly />
                    </div>
                    <div className={styles.reviewComment}>{review.text}</div>
                    <div className={styles.reviewDate}>
                      {moment(review.time_created).calendar()}
                    </div>
                  </div>
                ))}
              </div>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        {!fetching && (
          <>
            <Button onClick={props.handleClose} color="secondary">
              Close
            </Button>
            <Button target="_blank" href={info.url} color="primary">
              Open Yelp Page
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

RestaurantPreview.propTypes = {
  handleClose: PropTypes.func.isRequired,
  identifier: PropTypes.string.isRequired,
};

export default RestaurantPreview;
