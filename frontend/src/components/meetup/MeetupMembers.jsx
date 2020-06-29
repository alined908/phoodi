import React, {Component} from 'react'
import {List, ListItem, ListItemAvatar, ListItemText, Tooltip, Avatar, Typography, IconButton} from '@material-ui/core'
import { ReactComponent as Crown } from "../../assets/svgs/crown.svg";
import styles from '../../styles/meetup.module.css'
import {
    PersonAdd as PersonAddIcon,
    Block as BlockIcon,
    ExitToApp as ExitToAppIcon,
  } from "@material-ui/icons";
import {Link} from 'react-router-dom'


class MeetupMembers extends Component {

    addFriend = (e, email) => {
        e.preventDefault();
        this.props.sendFriendInvite(email);
    };

    determineIsUserCreator = (id) => {
        return this.props.meetup.creator.id === id;
    };

    determineisMemberNotFriend = (user) => {
        if (this.props.friends.length === 0 || this.props.user.id === user.id) {
          return false;
        }
    
        for (var i = 0; i < this.props.friends.length; i++) {
          let friend = this.props.friends[i];
          if (friend.user.id === user.id) {
            return false;
          }
        }
    
        return true;
    };

    render () {
        const members = this.props.members
        const isUserCreator = this.determineIsUserCreator(this.props.user.id);
        const isUserMember = this.props.isUserMember
        const isPast = this.props.isPast

        return (
            <List className={styles.shellList}>
                {Object.keys(members).map((key) => (
                    <Link key={key} to={`/profile/${members[key].user.id}`}>
                        <ListItem className={styles.member}>
                            <ListItemAvatar>
                                <Avatar src={members[key].user.avatar} className={styles.avatar}>
                                    {members[key].user.first_name.charAt(0)}
                                    {members[key].user.last_name.charAt(0)}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={members[key].user.first_name}
                                secondary={
                                    <>
                                        <Typography
                                            component="span"
                                            color="inherit"
                                            variant="body2"
                                        >
                                            {members[key].user.email + " "}
                                        </Typography>
                                    </>
                                }
                            />
                            {this.determineIsUserCreator(members[key].user.id) && (
                                <Tooltip title="Meetup Creator">
                                    <Crown width={24} height={24} />
                                </Tooltip>
                            )}
                            {members[key].ban && (
                                <Tooltip title="Used Ban">
                                    <BlockIcon color="secondary" />
                                </Tooltip>
                            )}

                            {(members[key].user.id === this.props.user.id && !isUserCreator) &&
                                <Tooltip title="You">
                                    <img
                                        style={{ width: 20, height: 20, marginLeft: 10 }}
                                        alt={"&#9787;"}
                                        src={`${process.env.REACT_APP_S3_STATIC_URL}/static/general/panda.png`}
                                    />
                                </Tooltip>
                            }
                            {/* {members[key].admin && 
                                                <Tooltip title="Admin">
                                                    <VerifiedUserIcon style={{color: "#3f51b5"}}/>
                                                </Tooltip>
                                            } */}
                            {/* {(isUserCreator && members[key].admin && this.props.user.id !== members[key].user.id) &&  
                                <Tooltip title="Demote Admin">
                                    <IconButton>
                                        <PersonAddDisabledIcon/>
                                    </IconButton>
                            </Tooltip> }
                            {(isUserCreator && !members[key].admin && this.props.user.id !== members[key].user.id) &&
                                <Tooltip title="Make Admin">
                                    <IconButton>
                                        <PersonAddIcon/>
                                    </IconButton>
                                </Tooltip>
                            } */}
                            {isUserMember && !isPast && members[key].user.id !== this.props.user.id && members[this.props.user.id].admin && (
                                <Tooltip title="Remove Member">
                                    <IconButton
                                        aria-label="remove-member"
                                        color="secondary"
                                        size="small"
                                        onClick={(e) =>
                                            this.props.leaveMeetup(e, members[key].user.email)
                                        }
                                    >
                                        <ExitToAppIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {this.determineisMemberNotFriend(members[key].user) && (
                                <Tooltip title="Add Friend">
                                    <IconButton
                                    color="primary"
                                    size="small"
                                    onClick={(e) =>
                                        this.addFriend(e, members[key].user.email)
                                    }
                                    >
                                        <PersonAddIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </ListItem>
                    </Link>
                ))}
            </List>
        )
    }
}

export default MeetupMembers