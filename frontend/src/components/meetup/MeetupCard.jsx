import React from 'react'
import {Divider, makeStyles, CardHeader, Card, CardActionArea, CardActions, CardContent, CardMedia, Button, Typography} from '@material-ui/core'
import {AccountCircle} from '@material-ui/icons';
import RoomIcon from '@material-ui/icons/Room';
import {Link} from 'react-router-dom'
import moment from 'moment';

const useStyles = makeStyles({
    card: {
        maxWidth: 300,
        width: 300
    },
    media: {
        height: 140
    }
})

const MeetupCard = ({meetup}) => {
    const classes = useStyles()

    return (
        <Link to={`/meetups/${meetup.uri}`}>
            <Card className={classes.card}>
                <CardHeader title={meetup.name} subheader={moment(meetup.datetime).local().format("MMM DD h:mm A")}/>
                <CardActionArea>
                    <CardMedia className={classes.media}/>

                    <CardContent>
                        <Typography>
                            <AccountCircle/>{Object.keys(meetup.members).length}
                        </Typography>
                        <Divider variant="middle" />
                        <Typography>
                            <RoomIcon/>{meetup.location}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Link>
    )
}
export default MeetupCard