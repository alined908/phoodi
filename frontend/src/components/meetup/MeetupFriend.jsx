import React from "react";
import {
  CheckCircle as CheckCircleIcon,
  Check as CheckIcon,
} from "@material-ui/icons";
import { sendMeetupInvite } from "../../actions";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  Typography,
  Avatar,
  CircularProgress,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tooltip,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { green } from "@material-ui/core/colors";
import PropTypes from "prop-types";
import { userPropType } from "../../constants/prop-types";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  wrapper: {
    margin: theme.spacing(1),
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -10,
    marginLeft: -10
  },
  check: {
    color: green[500],
  },
  listItem: {
    marginBottom: '1rem',
    transition: 'all .2s ease',
    '&:hover': {
      transform: 'scale(1.05)',
      backgroundColor: 'transparent'
    },
  },
  avatar:{
    marginRight: 15,
    boxShadow: 'var(--circular-shadow)'
  },
}));

const MeetupFriend = (props) => {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const classes = useStyles();
  const timer = React.useRef();

  React.useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    if (!loading) {
      setSuccess(false);
      setLoading(true);
      timer.current = setTimeout(() => {
        setLoading(false);
        setSuccess(true);
      }, 800);
    }
    props.sendMeetupInvite(props.uri, props.friend.email);
  };

  return (
    <Link to={`/profile/${props.friend.id}`}>
      <ListItem className={classes.listItem}>
        <ListItemAvatar>
          <Avatar className={classes.avatar} src={props.friend.avatar}>
            {props.friend.first_name.charAt(0)}
            {props.friend.last_name.charAt(0)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={props.friend.first_name}
          secondary={
            <>
              <Typography component="span" color="inherit" variant="body2">
                {props.friend.email + " "}
              </Typography>
            </>
          }
        ></ListItemText>
        {props.isMember && (
          <Tooltip title="Member">
            <CheckCircleIcon className={classes.check} />
          </Tooltip>
        )}
        {!props.isMember && (
          <div className={classes.wrapper}>
            <Button
              variant="contained"
              endIcon={success ? <CheckIcon /> : <></>}
              disabled={loading || success || props.isPast}
              color="primary"
              size="small"
              onClick={(event) => handleClick(event)}
            >
              Invite
            </Button>
            {loading && (
              <CircularProgress size={20} className={classes.buttonProgress} />
            )}
          </div>
        )}
      </ListItem>
    </Link>
  );
};

MeetupFriend.propTypes = {
  sendMeetupInvite: PropTypes.func.isRequired,
  friend: userPropType,
  isMember: PropTypes.bool.isRequired,
  uri: PropTypes.string.isRequired,
};

const mapDispatchToProps = {
  sendMeetupInvite,
};

export default connect(null, mapDispatchToProps)(MeetupFriend);
