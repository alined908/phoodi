import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Avatar, IconButton, Tooltip} from '@material-ui/core'
import {Link} from 'react-router-dom'
import {axiosClient} from "../../accounts/axiosClient"
import {getPreferences, addPreference, editPreference, deletePreference} from "../../actions/index"
import {Lock as LockIcon, LockOpen as LockOpenIcon, Search as SearchIcon, Edit as EditIcon} from '@material-ui/icons';
import {Friend, CategoryAutocomplete, Preferences} from "../components"

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
            locked: this.props.location.state ?  this.props.location.state.locked :true
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
        const [profile, friends] = await Promise.all(
            [
                axiosClient.get(`/api/users/${this.props.match.params.id}/`), 
                axiosClient.get(
                    `/api/users/${this.props.match.params.id}/friends/`, {headers: {
                        "Authorization": `JWT ${localStorage.getItem('token')}`
                }})
            ]
        )
        this.setState({user: profile.data, friends: friends.data, filteredFriends: friends.data, userLoaded: true})
    }

    handleDelete = (pref) => {
        this.props.deletePreference(this.props.user.id, pref.id)
    }

    handleLock = () => {
        this.setState({locked: !this.state.locked})
    }

    onTagsChange = (event, values) => {
        const category = values[0]
        const data = {category_id: category.id}
        this.props.addPreference(data, this.props.user.id)
    }

    handleSearchInputChange = (e) => {
        var filter = e.target.value;
        var friends = this.state.friends
        var newFriends;

        newFriends = friends.filter((friendship) => {
            let friendCriteria = false;
            let friend = friendship.user;
            const friendName = friend.first_name + " " + friend.last_name
            friendCriteria = (friendName.toLowerCase().includes(filter.toLowerCase())) || (friend.email.toLowerCase().includes(filter.toLowerCase()))
            return friendCriteria
        })

        this.setState({searchInput: filter, filteredFriends: newFriends})
    }

    render () {
        const isUser = this.props.user.id.toString() === this.props.match.params.id;

        const renderPreferences = () => {
            return (
                <div className="column">
                    <div className="column-inner">
                        <div className="column-top">
                            <div>Preferences</div>
                            <div>
                                {isUser && (this.state.locked ?
                                    <Tooltip title="Click to Unlock">
                                        <IconButton color="primary" onClick={this.handleLock}>
                                            <LockIcon>
                                            </LockIcon>
                                        </IconButton>
                                    </Tooltip> 
                                    : 
                                    <Tooltip title="Click to Lock">
                                        <IconButton onClick={this.handleLock}>
                                            <LockOpenIcon>
                                            </LockOpenIcon>
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </div>
                        </div>  
                        <Preferences locked={this.state.locked} isUser={isUser} user={this.props.user.id.toString()}/>
                        <div className="column-bottom">
                            {!this.state.locked && <>
                                <SearchIcon/>
                                <CategoryAutocomplete fullWidth={true} size="small" entries={this.state.entries} handleClick={this.onTagsChange} label="Search to add categories.."/>
                            </>
                            }
                        </div> 
                    </div>
                </div>
            )
        }
    
        const renderProfile = () => {
            return (
                <div className="column-center">
                    <div className="column-inner profile-header">
                        <div className="column-top">
                            <div>Profile</div>
                            <div>
                                {isUser && 
                                    <Link to="/profile/edit">
                                        <Tooltip title="Edit Profile">
                                            <IconButton color="primary">
                                                <EditIcon></EditIcon>
                                            </IconButton>
                                        </Tooltip>
                                    </Link>
                                }
                            </div>
                        </div>
                        <div className="column-middle">
                            <div className="profile-content">
                                <div className="pic">
                                    <Avatar className="user-avatar" src={this.state.user.avatar}>{this.state.user.first_name.charAt(0)}{this.state.user.last_name.charAt(0)}</Avatar>
                                </div>
                                <div>
                                    <div className="profile-content-name">
                                        {this.state.user.first_name} {this.state.user.last_name}
                                    </div>
                                    <div className="profile-content-email">
                                        {this.state.user.email}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="column-inner recent-activity">
                        <div className="column-top">
                            <div>Past Activity</div>
                        </div>
                        <div className="column-middle">
                            
                        </div>
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
                                <Friend isUserFriend={isUser} friend={friend}/>
                            )}
                        </div> 
                        <div className="column-bottom">
                            <SearchIcon/>
                            <input className="chat-input" type="text" placeholder="Search Friends..." value={this.state.searchInput} onChange={this.handleSearchInputChange}></input>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="profile">
                {this.state.userLoaded && renderPreferences()}
                {this.state.userLoaded && renderProfile()}
                {this.state.userLoaded && renderFriends()}
            </div>
        )
    }
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
    deletePreference
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile)