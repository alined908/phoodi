import React from 'react'
import {makeStyles, Typography, Paper, Badge, Tooltip} from '@material-ui/core'
import {Today as TodayIcon, Notifications as NotificationsIcon, Room as RoomIcon, AccountCircle as AccountCircleIcon} from '@material-ui/icons'
import {GroupAvatars} from "../components"
import {Link} from 'react-router-dom'
import moment from 'moment';
import Skeleton from '@material-ui/lab/Skeleton';

const useStyles = makeStyles({
    paper: {
        width: "100%",
        height: "100%",
    },
    middle: {
        height: "150px",
        margin: "1rem 0",
    }
})

const MeetupCard = ({meetup}) => {
    const classes = useStyles();
    const members = Object.values(meetup.members)
    const users = []
    members.map((member) => users.push(member.user))

    return (
        <>
        {meetup ? 
            <Link to={`/meetups/${meetup.uri}`}>
                <Paper square={true} className={classes.paper + " elevate"}>
                    <div className="meetup-card-inner">
                        <div className="meetup-card-top"> 
                            <div className="meetup-card-icon flex-clip-2">
                                <Tooltip title={meetup.name}>
                                    <Typography className="flex-ellipse" variant="h5">{meetup.name}</Typography>
                                </Tooltip>
                            </div>
                            <div className="meetup-card-icon">
                                <TodayIcon/>{moment(meetup.date).local().format("dddd, MMMM D")}
                            </div>
                            {meetup.notifs !== null && meetup.notifs > 0 && <Badge badgeContent={meetup.notifs} color="primary">
                                <NotificationsIcon />
                            </Badge>
                            }  
                        </div>
                        <div className={classes.middle}>
                            <Skeleton animation="wave" variant="rect" height="100%"></Skeleton>
                        </div>
                        <div className="meetup-card-bottom">
                            <Tooltip title={meetup.location}><div className="meetup-card-icon flex-clip"><RoomIcon/><div className="flex-ellipse">{meetup.location}</div></div></Tooltip>
                            <div className="meetup-card-icon">
                                <GroupAvatars members={users}/>
                                {users.length + " member"}{users.length > 1 ? "s" : ""}
                            </div>
                        </div>
                    </div>
                </Paper>
            </Link> : <Paper className={classes.paper} elevation={3}><Skeleton variant="rect" animation="wave"/></Paper> 
        }
        </>
    )
}
export default MeetupCard