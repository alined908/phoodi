import React, {Component} from 'react'
import styles from '../../styles/feed.module.css'
import {DisplayRating, ActivityComments, ActivityCommentForm, MeetupCard} from '../components'
import {postActivityLike} from '../../actions/feed'
import {Avatar, Card, IconButton, Divider, CardHeader, CardMedia, CardContent, CardActions, } from '@material-ui/core'
import {Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon, CommentOutlined as CommentOutlinedIcon} from '@material-ui/icons'
import {Link} from 'react-router-dom'
import moment from 'moment'

class PostActivity extends Component {
    render(){
        return(
            <Card>
                PostActivity
            </Card>
        )
    }
}

class MeetupActivity extends Component {
    render(){
        const activity = this.props.activity
        return(
            <>
                <CardHeader
                    avatar={
                        <Link to={`/profile/${activity.actor.id}`}>
                            <Avatar src={activity.actor.avatar}>
                                {activity.actor.first_name.charAt(0)}
                                {activity.actor.last_name.charAt(0)}
                            </Avatar>
                        </Link>
                    }
                    title={
                        <Link to={`/profile/${activity.actor.id}`}>
                            {activity.actor.first_name} {activity.actor.last_name}
                        </Link>
                    }
                    subheader={
                        <span>
                            <span>
                                {moment(activity.created_at).fromNow()}
                            </span>
                            &nbsp;-&nbsp;
                            <span>
                                {activity.verb} meetup - <Link to={`/meetups/${activity.action_object.uri}`}>{activity.action_object.name}</Link>
                            </span>
                        </span>
                    }
                />
                <Divider/>
                <div className={styles.contentDisplay}>
                    <MeetupCard meetup={activity.action_object}/>
                </div>
            </>
        )
    }
}

class ReviewActivity extends Component {
    render(){
        const activity = this.props.activity

        return (
            <>
                <CardHeader
                    avatar={
                        <Link to={`/profile/${activity.actor.id}`}>
                            <Avatar src={activity.actor.avatar}>
                                {activity.actor.first_name.charAt(0)}
                                {activity.actor.last_name.charAt(0)}
                            </Avatar>
                        </Link>
                    }
                    action={
                        <DisplayRating score={activity.action_object.rating}/>
                    }
                    title={
                        <Link to={`/profile/${activity.actor.id}`}>
                            {activity.actor.first_name} {activity.actor.last_name}
                        </Link>
                    }
                    subheader={
                        <span>
                            <span>
                                {moment(activity.created_at).fromNow()}
                            </span>
                            &nbsp;-&nbsp;
                            <span>
                                Reviewed <Link to={`/restaurants/${activity.target.url}`}>{activity.target.name}</Link>
                            </span>
                        </span>
                    }
                />
                <div className={styles.contentDisplay}>
                    <Link to={`/restaurants/${activity.target.url}`}>
                        <CardMedia
                            className={styles.cardMedia}
                            image={activity.target.yelp_image}
                            title={activity.target.name}
                        />
                    </Link>
                </div>
                <CardContent>
                    {activity.action_object.text}
                </CardContent>
            </>
        )
    }
}

class FriendshipActivity extends Component {
    render(){
        return(
            <Card>
                Friendship
            </Card>
        )
    }
}

class MeetupEventActivity extends Component {
    render(){
        const activity = this.props.activity
        return(
            <>
                <CardHeader
                    avatar={
                        <Link to={`/profile/${activity.actor.id}`}>
                            <Avatar src={activity.actor.avatar}>
                                {activity.actor.first_name.charAt(0)}
                                {activity.actor.last_name.charAt(0)}
                            </Avatar>
                        </Link>
                    }
                    title={
                        <Link to={`/profile/${activity.actor.id}`}>
                            {activity.actor.first_name} {activity.actor.last_name}
                        </Link>
                    }
                    subheader={
                        <span>
                            <span>
                                {moment(activity.created_at).fromNow()}
                            </span>
                            &nbsp;-&nbsp;
                            <span>
                                {activity.verb} - <Link to={`/meetups/${activity.target.uri}`}>{activity.action_object.title}</Link>
                            </span>
                        </span>
                    }
                />
                <Divider/>
                <div className={styles.contentDisplay}>
                    <MeetupCard meetup={activity.target}/>
                </div>
            </>
        )
    }
}

class FeedActivity extends Component {
    constructor(props){
        super(props);
        this.state = {
            isLiked: props.activity.like,
            numLikes: props.activity.likes_count,
            numComments: props.activity.comment_count,
            comments: props.activity.comments
        }
    }

    handleLike = (newStatus) => {
        const likeChange = (newStatus === 1 ? 1 : -1)
        this.setState(
            {
                isLiked: !this.state.isLiked,
                numLikes: this.state.numLikes + likeChange
            }, 
            () => postActivityLike(this.props.activity.id, newStatus)
        )
    }

    render () {
        console.log(this.props.activity)
        const activity = this.props.activity;
        const description = activity.description;
        const verb = activity.verb
        let type;
        
        if (description === 'post') {
            type = <PostActivity activity={activity}/>
        } else if (description === "review"){
            type = <ReviewActivity activity={activity}/>
        } else if (description === 'friendship'){
            type = <FriendshipActivity activity={activity}/>
        } else if (description === "meetup"){
            if (verb==="created" || verb==="joined"){
                type = <MeetupActivity activity={activity}/>
            } else if (verb === "created event") {
                type = <MeetupEventActivity activity={activity}/>
            }
        } else {
            type = "No type"
        }

        return (
            <div className={styles.activityWrapper}>
                <Card>
                    {type}
                    <Divider/>
                    <CardActions>
                        <span> 
                            {this.state.isLiked ?
                                <IconButton onClick={() => this.handleLike(0)} color="secondary">
                                    <FavoriteIcon fontSize="inherit"/>
                                </IconButton>
                                :
                                <IconButton onClick={() => this.handleLike(1)} color="secondary">
                                    <FavoriteBorderIcon fontSize="inherit"/>
                                </IconButton>
                            }
                            
                            <span>
                                {this.state.numLikes} likes
                            </span>
                        </span>
                        <span>
                            <CommentOutlinedIcon/>
                            <span>
                                {activity.comment_count} comments
                            </span>
                        </span>
                    </CardActions>
                    <Divider/>
                    <CardContent>
                        Comments
                    </CardContent>
                    <Divider/>
                    <ActivityComments 
                        activity={activity}
                        comments={activity.comments}
                    />
                    <ActivityCommentForm
                        form={`activity-${activity.id}`}
                        user={this.props.user}
                        activity={activity}
                        parent={null}
                    />
                </Card>
            </div>
        )
    }
}

export default FeedActivity