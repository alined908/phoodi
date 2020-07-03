import React, {Component} from 'react'
import {FeedActivity} from '../components'
import SkeletonActivity from '../skeleton/SkeletonActivity'
import styles from '../../styles/feed.module.css'

class FeedActivities extends Component {
    
    render () {
        return (
            <div className={styles.feedActivities}>
                {this.props.isActivitiesFetching && [...Array(10).keys()].map((num) =>
                    <div className={styles.activityWrapper}>
                        <SkeletonActivity/>
                    </div>
                )}
                {this.props.isActivitiesInitialized && this.props.activities.map((activity) => 
                    <FeedActivity
                        user={this.props.user}
                        activity={activity}
                    />
                )}
            </div>
        )
    }
}

export default FeedActivities