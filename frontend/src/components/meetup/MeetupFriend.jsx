import React from "react"
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import {sendMeetupInvite} from '../../actions/invite'
import {connect} from 'react-redux'
import { makeStyles } from '@material-ui/core/styles';
import { Button, Typography, Avatar, CircularProgress, ListItem, ListItemText,ListItemAvatar} from "@material-ui/core"
import {Link} from 'react-router-dom'
import { green } from '@material-ui/core/colors';

const useStyles = makeStyles(theme => ({
    root: {
      display: 'flex',
      alignItems: 'center',
    },
    wrapper: {
      margin: theme.spacing(1),
      position: 'relative',
    },
    buttonProgress: {
      color: green[500],
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -12,
      marginLeft: -12,
    },
  }));


const MeetupFriend = (props) => {
    const [loading, setLoading] = React.useState(false)
    const classes = useStyles();
    const timer = React.useRef();

    React.useEffect(() => {
        return () => {
          clearTimeout(timer.current);
        };
      }, []);

    const handleClick = (e) => {
        e.preventDefault()
        if (!loading) {
            setLoading(true);
            timer.current = setTimeout(() => {
                setLoading(false);
              }, 800);
        }
        props.sendMeetupInvite(props.uri, props.friend.email)
    }

    return (
        <Link to={`/profile/${props.friend.id}`}>
            <ListItem>
                <ListItemAvatar>
                    <Avatar src={props.friend.avatar}>{props.friend.first_name.charAt(0)}{props.friend.last_name.charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={props.friend.first_name} secondary={<>
                    <Typography component="span" color="inherit" variant="body2"> 
                        {props.friend.email + " "}
                    </Typography>
                    </>
                }>
                </ListItemText>
                {props.isMember && <CheckCircleIcon></CheckCircleIcon>}
                {!props.isMember && 
                    <div className={classes.wrapper}>
                        <Button variant="contained" disabled={loading} color="primary" size="small" onClick={(event) => handleClick(event)}>
                            Invite
                        </Button>
                        {loading && <CircularProgress size={24} className={classes.buttonProgress} />}
                    </div>
                }
            </ListItem>
        </Link>
    )
}

const mapDispatchToProps = {
    sendMeetupInvite
}

export default connect(null, mapDispatchToProps)(MeetupFriend)