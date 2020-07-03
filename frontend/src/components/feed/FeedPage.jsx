import React, {Component} from 'react'
import {connect} from 'react-redux'
import {getActivities, addActivity} from '../../actions'
import {Avatar} from '@material-ui/core'
import {Link} from 'react-router-dom'
import {People as PeopleIcon, Restaurant as RestaurantIcon, Event as EventIcon, Chat as ChatIcon} from '@material-ui/icons'
import {FeedForm, FeedActivities} from '../components'
import { Helmet } from "react-helmet";
import styles from '../../styles/feed.module.css'

class FeedNavigation extends Component {
    render () {
        const user = this.props.user

        return (
            <div className={styles.barWrapper}>
                <Link to={`/profile/${user.id}`}>
                    <div className={styles.barEntry}>
                        <span className={`${styles.barIcon} ${styles.barAvatarWrapper}`}>
                            <Avatar className={styles.barAvatar} src={user.avatar} >
                                {user.first_name.charAt(0)}
                                {user.last_name.charAt(0)}
                            </Avatar>
                        </span>
                        <span className={styles.barDescription}>
                            {user.first_name} {user.last_name}
                        </span> 
                    </div>
                </Link>
                <Link to="/r/search">
                    <div className={styles.barEntry}>
                        <span className={styles.barIcon}>
                            <RestaurantIcon/>
                        </span>
                        <span className={styles.barDescription}>
                            Restaurants
                        </span> 
                    </div>
                </Link>
                <Link to="/meetups">
                    <div className={styles.barEntry}>
                        <span className={styles.barIcon}>
                            <EventIcon/>
                        </span>
                        <span className={styles.barDescription}>
                            Meetups
                        </span> 
                    </div>
                </Link>
                <Link to="/friends">
                    <div className={styles.barEntry}>
                        <span className={styles.barIcon}>
                            <PeopleIcon/>
                        </span>
                        <span className={styles.barDescription}>
                            Friends
                        </span> 
                    </div>
                </Link>
                <Link to="/chat">
                    <div className={styles.barEntry}>
                        <span className={styles.barIcon}>
                            <ChatIcon/>
                        </span>
                        <span className={styles.barDescription}>
                            Chat
                        </span> 
                    </div>
                </Link>
            </div>
        )
    }
}

class FeedContacts extends Component {
    render () {
        const friends = this.props.friends

        return (
            <div className={styles.feedSection}>
                <div className={styles.feedSectionTitle}>
                    Contacts
                </div>
                <div className={styles.feedSectionContent}>
                    {friends.map((friend) => 
                        <Link to={`/profile/${friend.user.id}`}>
                            <div className={styles.barEntry}>
                                <span className={`${styles.barIcon} ${styles.barAvatarWrapper}`}>
                                    <Avatar className={styles.barAvatar} src={friend.user.avatar} >
                                        {friend.user.first_name.charAt(0)}
                                        {friend.user.last_name.charAt(0)}
                                    </Avatar>
                                </span>
                                <span className={styles.barDescription}>
                                    {friend.user.first_name} {friend.user.last_name}
                                </span> 
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        )
    }
}

class FeedPage extends Component {

    componentDidMount(){
        this.props.getActivities()
    }

    render () {
        return (
            <div className={styles.feedWrapper}>
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>
                        Feed
                    </title>
                    <meta name="description" content="Feed" />
                </Helmet>
                <div className={styles.feedLeft}>
                    <FeedNavigation user={this.props.user}/>
                </div>
                <div className={styles.feed}>
                    <FeedForm 
                        addActivity={this.props.addActivity}
                        user={this.props.user}
                    />
                    <FeedActivities 
                        isActivitiesFetching={this.props.isActivitiesFetching}
                        isActivitiesInitialized={this.props.isActivitiesInitialized}
                        activities={this.props.activities}
                        user={this.props.user}
                    />
                </div>
                <div className={styles.feedRight}>
                    {this.props.friends.length > 0 && 
                        <FeedContacts friends={this.props.friends}/>
                    }
                    
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        activities: state.feed.activities,
        isActivitiesFetching: state.feed.isActivitiesFetching,
        isActivitiesInitialized: state.feed.isActivitiesInitialized,
        user: state.user.user,
        friends: state.user.friends
    }
}

const mapDispatchToProps = {
    getActivities,
    addActivity
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedPage)