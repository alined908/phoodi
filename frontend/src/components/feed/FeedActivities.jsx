import React, {Component} from 'react'
import {FeedActivity} from '../components'
import styles from '../../styles/feed.module.css'

class FeedActivities extends Component {
    
    render () {
        return (
            <div className={styles.feedActivities}>
                {this.props.activities.map((activity) => 
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