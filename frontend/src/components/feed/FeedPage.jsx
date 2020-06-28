import React, {Component} from 'react'
import {connect} from 'react-redux'
import {getActivities} from '../../actions'
import {FeedForm, FeedActivities} from '../components'
import styles from '../../styles/feed.module.css'

class FeedPage extends Component {

    componentDidMount(){
        this.props.getActivities()
    }

    render () {
        return (
            <div className={styles.feedWrapper}>
                <div className={styles.feedLeft}>

                </div>
                <div className={styles.feed}>
                    <FeedForm 
                        user={this.props.user}
                    />
                    <FeedActivities 
                        activities={this.props.activities}
                        user={this.props.user}
                    />
                </div>
                <div className={styles.feedRight}>

                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        activities: state.feed.activities,
        user: state.user.user
    }
}

const mapDispatchToProps = {
    getActivities
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedPage)