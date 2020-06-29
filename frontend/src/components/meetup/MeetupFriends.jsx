import React, {Component} from 'react'
import {List, CircularProgress} from '@material-ui/core'
import {MeetupFriend} from '../components'
import styles from '../../styles/meetup.module.css'

class MeetupFriends extends Component {
    determineIsFriendMember = (friend, members) => {
        return friend in members;
    };
    

    render () {
        const meetup = this.props.meetup

        return (
            <List className={styles.shellList}>
                {this.props.isFriendsFetching && (
                    <div className="loading">
                        <CircularProgress size={30}/>
                    </div>
                )}
                {this.props.friends.map((friend) => (
                    <MeetupFriend
                        key={friend.id}
                        friend={friend.user}
                        isMember={this.determineIsFriendMember(friend.user.id, meetup.members)}
                        isPast={this.props.isPast}
                        uri={meetup.uri}
                    />
                ))}
            </List>
        )
    }
}   

export default MeetupFriends