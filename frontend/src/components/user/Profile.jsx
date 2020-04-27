import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Avatar, IconButton, Tooltip, Paper} from '@material-ui/core'
import {axiosClient} from "../../accounts/axiosClient"
import {getPreferences, addPreference, editPreference} from "../../actions/index"
import {Link} from 'react-router-dom'
import {sendFriendInvite} from '../../actions/invite'
import {Lock as LockIcon, LockOpen as LockOpenIcon, Search as SearchIcon, Edit as EditIcon, PersonAdd as PersonAddIcon} from '@material-ui/icons';
import {Friend, CategoryAutocomplete, Preferences, RegisterPage} from "../components"
import PropTypes from "prop-types"
import { userPropType } from '../../constants/prop-types'
import {history} from '../MeetupApp'
import {Helmet} from 'react-helmet'
import styles from '../../styles/profile.module.css'
import moment from "moment"

class Profile extends Component {
    constructor(props){
        super(props);
        this.state = {
            user: {},
            userLoaded: false,
            friends: [],
            filteredFriends: [],
            searchInput: "",
            entries: [],
            locked: this.props.location.state ?  this.props.location.state.locked :true,
            editProfileForm: false
        }
    }

    componentDidMount(){
        this.props.getPreferences(this.props.match.params.id)
        this.getInformation()
    }

    componentDidUpdate(prevProps){
        if (this.props.match.params.id !== prevProps.match.params.id){
            this.props.getPreferences(this.props.match.params.id)
            this.getInformation()
        }
    }

    getInformation = async () => {
        try {
            const [profile, friends] = await Promise.all(
                [
                    axiosClient.get(`/api/users/${this.props.match.params.id}/`,  {headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }}
                ), 
                    axiosClient.get(
                        `/api/users/${this.props.match.params.id}/friends/`, {headers: {
                            "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }})
                ]
            )
            this.setState(
                {
                    user: profile.data, friends: friends.data, 
                    filteredFriends: friends.data, userLoaded: true
                }
            )
        }
        catch(e){
            history.push("/404")
        }
    }

    handleLock = () => {
        this.setState({locked: !this.state.locked})
    }

    onTagsChange = (event, values) => {
        const category = values[0]
        const data = {category_id: category.id}
        this.props.addPreference(data, this.props.user.id)
    }

    openFormModal = () => {
        this.setState({editProfileForm: !this.state.editProfileForm})
    }

    handleSearchInputChange = (e) => {
        let filter = e.target.value;
        let friends = this.state.friends
        let newFriends;

        newFriends = friends.filter((friendship) => {
            let friendCriteria = false;
            let friend = friendship.user;
            const friendName = friend.first_name + " " + friend.last_name
            friendCriteria = (friendName.toLowerCase().includes(filter.toLowerCase())) || (friend.email.toLowerCase().includes(filter.toLowerCase()))
            return friendCriteria
        })

        this.setState({searchInput: filter, filteredFriends: newFriends})
    }

    isUserFriend = () => {
        for(var i = 0; i < this.state.friends.length; i++){
            let user = this.state.friends[i].user
            if (user.id === this.props.user.id){
                return true
            }
        }

        return false
    }

    addFriend = () => {
        this.props.sendFriendInvite(this.state.user.email)
    }

    formatActivity = (activity) => {
        console.log(activity)
        const verb = activity.verb
        let activityHTML;

        if (verb === "created" || verb === "joined"){
            activityHTML = (
                <>
                    <span>{verb} a</span>
                    <span className={styles.space}>{activity.action_object.public ? "public" : "private"}</span>
                    <span className={styles.space}>meetup named</span>   
                    <span className={styles.space}>
                        <Link className={styles.link} to={`/meetups/${activity.action_object.uri}`}>
                            {activity.action_object.name}
                        </Link>
                    </span>.
                </>
            )
        } else if (verb === "became friends with") {
            activityHTML = (
                <>
                    <span>{verb}</span>
                    <span className={styles.space}>
                        <Link className={styles.link} to={`/profile/${activity.action_object.id}`}>
                            <Avatar className={styles.useravatar} src={activity.action_object.avatar}>
                                {activity.action_object.first_name.charAt(0)} 
                                {activity.action_object.last_name.charAt(0)}
                            </Avatar>
                            {activity.action_object.first_name} {activity.action_object.last_name}
                        </Link>
                    </span>.
                </>
            )
        } else if (verb === "added") {
            activityHTML = (
                <>
                </>
            )
        } else if (verb === "created event"){
            activityHTML = (
                <>
                    <span>added</span>
                    <span className={styles.space}>
                        {activity.action_object ? 
                            `an event named ${activity.action_object.title} to` : 
                            "a DELETED event to"
                        }
                    </span> 
                    <span className={styles.space}>
                        <Link className={styles.link} to={`/meetups/${activity.target.uri}`}>
                            {activity.target.name}
                        </Link>
                    </span>.
                </>
            )
        } else {
            activityHTML = <></>
        }

        return activityHTML
    }

    render () {
        const isUser = this.props.user.id.toString() === this.props.match.params.id;
        const isUserFriend = !isUser && !this.isUserFriend()

        const renderPreferences = () => {
            return (
                <div className="column">
                    <div className="column-inner">
                        <div className="column-top">
                            <div>Preferences</div>
                            <div>
                                {isUser && (this.state.locked ?
                                    <Tooltip title="Click to Reorder">
                                        <IconButton color="primary" onClick={this.handleLock}>
                                            <LockIcon/>
                                        </IconButton>
                                    </Tooltip> 
                                    : 
                                    <Tooltip title="Click to Lock">
                                        <IconButton onClick={this.handleLock}>
                                            <LockOpenIcon/>
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </div>
                        </div>  
                        <Preferences locked={this.state.locked} isUser={isUser}/>
                        <div className="column-bottom">
                            {isUser && <SearchIcon/>}
                            {isUser && 
                                <CategoryAutocomplete 
                                    fullWidth={true} 
                                    size="small" 
                                    entries={this.state.entries} 
                                    handleClick={this.onTagsChange} 
                                    label="Search to add categories.."
                                />
                            }
                        </div> 
                    </div>
                </div>
            )
        }
    
        const renderProfile = () => {
            return (
                <div className="column-center">
                    <div className={`column-inner ${styles.header}`}>
                        <div className="column-top">
                            <div>Profile</div>
                            <div>
                                {isUserFriend && 
                                    <Tooltip title="Add Friend">
                                        <IconButton color="primary" onClick={this.addFriend}>
                                            <PersonAddIcon/>
                                        </IconButton>
                                    </Tooltip>
                                }
                                {isUser && 
                                    <Tooltip title="Edit Profile">
                                        <IconButton color="primary" onClick={this.openFormModal}>
                                            <EditIcon/>
                                        </IconButton>
                                    </Tooltip>
                                }
                                {this.state.editProfileForm && 
                                    <RegisterPage type="edit" handleClose={this.openFormModal} open={this.state.editProfileForm}/>
                                }
                            </div>
                        </div>
                        <div className="column-middle">
                            <div className={styles.content}>
                                <div className="pic">
                                    <Avatar className={styles.userAvatar} src={this.state.user.avatar}>
                                        {this.state.user.first_name.charAt(0)}
                                        {this.state.user.last_name.charAt(0)}
                                    </Avatar>
                                </div>
                                <div>
                                    <div className={styles.contentName}>
                                        {this.state.user.first_name} {this.state.user.last_name}
                                    </div>
                                    <div className={styles.contentEmail}>
                                        {this.state.user.email}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`column-inner ${styles.recentActivity}`}>
                        <div className="column-top">
                            <div>Past Activity</div>
                        </div>
                        <Paper className={styles.pastactivity} elevation={6}>
                            {this.state.user.activity.map((activity) =>
                                <div className={styles.activity}>
                                    <div className={styles.activityinfo}>
                                        <div className={styles.activityuser}>
                                            <Avatar className={styles.useravatar} src={this.state.user.avatar}>
                                                {this.state.user.first_name.charAt(0)}
                                                {this.state.user.last_name.charAt(0)}
                                            </Avatar>
                                            
                                        </div>
                                        {this.state.user.first_name} {this.state.user.last_name} &nbsp;
                                        
                                        {this.formatActivity(activity)}
                                        
                                    </div>
                                    <div className={styles.activitydate}>
                                        {moment(activity.timestamp).calendar()}
                                    </div>
                                </div>
                            )}
                        </Paper>
                      
                    </div>
                </div>
            )     
        }
        
        const renderFriends = () => {
            return (
                <div className="column">
                    <div className="column-inner">
                        <div className="column-top">
                            <div>Friends</div>
                            <div></div>
                        </div>
                        <div className="column-middle">
                            {this.state.filteredFriends.map((friend) => 
                                <Friend key={friend.id} isUserFriend={isUser} friend={friend}/>
                            )}
                        </div> 
                        <div className="column-bottom">
                            <SearchIcon/>
                            <input 
                                className="chat-input" 
                                type="text" 
                                placeholder="Search Friends..." 
                                value={this.state.searchInput} 
                                onChange={this.handleSearchInputChange}
                            />
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className={styles.profile}>
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>
                        {`${this.state.user.first_name !== undefined ? this.state.user.first_name : ""} 
                        ${ this.state.user.last_name !== undefined ? this.state.user.last_name : ""}`}
                    </title>
                    <meta name="description" content="Phoodie Profile" />
                </Helmet>
                {this.state.userLoaded && renderPreferences()}
                {this.state.userLoaded && renderProfile()}
                {this.state.userLoaded && renderFriends()}
            </div>
        )
    }
}

Profile.propTypes = {
    user: userPropType,
    getPreferences: PropTypes.func.isRequired, 
    addPreference: PropTypes.func.isRequired,
    editPreference: PropTypes.func.isRequired
}

function mapStateToProps(state) {
    return {
        user: state.user.user,
    }
}

const mapDispatchToProps = {
    getPreferences,
    addPreference,
    editPreference,
    sendFriendInvite
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)