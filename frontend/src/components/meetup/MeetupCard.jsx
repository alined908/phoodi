import React from "react";
import {
  makeStyles,
  Typography,
  Badge,
  Tooltip,
  Avatar,
} from "@material-ui/core";
import {
  Today as TodayIcon,
  Notifications as NotificationsIcon,
  Room as RoomIcon,
} from "@material-ui/icons";
import { GroupAvatars } from "../components";
import { Link } from "react-router-dom";
import moment from "moment";
import { meetupPropType } from "../../constants/prop-types";
import styles from "../../styles/meetup.module.css";

const useStyles = makeStyles({
  middle: {
    height: "150px",
    margin: "1rem 0",
  },
});

const MeetupCard = ({ meetup, onHover, index }) => {
  const classes = useStyles();
  const members = Object.values(meetup.members);
  const users = [];
  members.map((member) => users.push(member.user));

  const handleHover = (index) => {
      onHover(index)
  }

  return (
    <Link to={`/meetups/${meetup.uri}`}>
      <div 
        className={styles.card}
        onMouseEnter={onHover ? () => handleHover(index + 1) : null}
        onMouseLeave={onHover ? () => handleHover(null) : null}
      >
        <div className={styles.cardInner}>
            <div className={styles.cardTop}>
            <div className={`${styles.cardIcon} ${styles.flexClip2}`}>
                <Tooltip title={meetup.name}>
                <Typography className={styles.flexEllipse} variant="h5">
                    {meetup.name}
                </Typography>
                </Tooltip>
            </div>
            <div className={styles.cardIcon}>
                <TodayIcon />
                {moment(meetup.date).local().format("dddd, MMMM D")}
            </div>
            {meetup.notifs !== null && meetup.notifs > 0 && (
                <Badge badgeContent={meetup.notifs} color="primary">
                <NotificationsIcon />
                </Badge>
            )}
            </div>
            {meetup.categories.length === 0 ? (
            <div className={`${classes.middle} ${styles.cardEvents}`}>
                <div className={styles.cardEventsHeader}>Events</div>
                <div className={styles.cardEventsCategories}>
                    
                </div>
            </div>
            ) : (
            <div className={`${classes.middle} ${styles.cardEvents}`}>
                <div className={styles.cardEventsHeader}>Events</div>
                <div className={styles.cardEventsCategories}>
                {meetup.categories.slice(0, 4).map((category) => (
                    <div
                    key={category.id}
                    className={styles.cardEventsCategory}
                    >
                    <Avatar
                        style={{ width: 28, height: 28 }}
                        variant="square"
                        src={`${process.env.REACT_APP_S3_STATIC_URL}/static/category/${category.api_label}.png`}
                    />
                    {category.label}
                    </div>
                ))}
                </div>
            </div>
            )}
            <div className={styles.cardBottom}>
            <Tooltip title={meetup.location}>
                <div className={`${styles.cardIcon} ${styles.flexClip}`}>
                <RoomIcon />
                <div className={styles.flexEllipse}>{meetup.location}</div>
                </div>
            </Tooltip>
            <div className={`${styles.cardIcon} ${styles.flexClip}`}>
                <GroupAvatars members={users} />
                <span
                className={`${styles.flexEllipse} ${styles.cardMembers}`}
                >
                {users.length + " member"}
                {users.length > 1 ? "s" : ""}
                </span>
            </div>
            </div>
        </div>
        </div>
    </Link>
    
  );
};

MeetupCard.propTypes = {
  meetup: meetupPropType,
};

export default MeetupCard;
