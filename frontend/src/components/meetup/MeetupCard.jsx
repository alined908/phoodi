import React from 'react'
import {makeStyles, Typography, Paper, Badge} from '@material-ui/core'
import {AccountCircle} from '@material-ui/icons';
import TodayIcon from '@material-ui/icons/Today';
import NotificationsIcon from '@material-ui/icons/Notifications';
import RoomIcon from '@material-ui/icons/Room';
import {Link} from 'react-router-dom'
import moment from 'moment';
import Skeleton from '@material-ui/lab/Skeleton';

const useStyles = makeStyles({
    paper: {
        width: "100%",
        height: "300px",
    },
    middle: {
        backgroundPosition: 'center', 
        backgroundSize: 'cover', 
        backgroundRepeat: 'no-repeat',
        height: "250px",
        margin: "1rem 0"
    }
})

const MeetupCard = ({meetup}) => {
    const classes = useStyles();

    return (
        <>
        {meetup ? 
            <Link to={`/meetups/${meetup.uri}`}>
                <Paper className={classes.paper} elevation={3}>
                    <div className="meetup-card-inner">
                        <div className="meetup-card-top"> 
                            <Typography variant="h5">{meetup.name} </Typography>
                            <div className="meetup-card-icon"><TodayIcon/>{moment(meetup.date).local().format("ddd, MMM D")}</div>
                            {meetup.notifs !== null && meetup.notifs > 0 && <Badge badgeContent={meetup.notifs} color="primary">
                                <NotificationsIcon />
                            </Badge>
                            }  
                        </div>
                        <div className={classes.middle}>
                        </div>
                        <div className="meetup-card-bottom">
                            <div className="meetup-card-icon"><RoomIcon/>{meetup.location}</div>
                            <div className="meetup-card-icon"><AccountCircle/>{Object.keys(meetup.members).length}</div>
                        </div>
                    </div>
                </Paper>
            </Link> : <Paper className={classes.paper} elevation={3}><Skeleton variant="rect" animation="wave"/></Paper> 
        }
        </>
    )
}
export default MeetupCard