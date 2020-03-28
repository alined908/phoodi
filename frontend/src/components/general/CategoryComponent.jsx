import React, {Component} from "react"
import {axiosClient} from '../../accounts/axiosClient'
import {Avatar, Tooltip, IconButton, Grid, Grow} from '@material-ui/core'
import {getPublicMeetups} from "../../actions/meetup";
import {Friend, MeetupCard} from '../components'
import {FavoriteBorder as FavoriteBorderIcon, Favorite as FavoriteIcon, Search as SearchIcon} from '@material-ui/icons';
import {addPreference, deletePreference} from '../../actions/index'
import {connect} from 'react-redux'

class CategoryComponent extends Component {
    constructor(props){
        super(props)
        this.state = {
            category: {},
            friends: [],
            meetups: [],
            loadingError: false,
            liked: false,
            numLiked: 0
        }
    }

    componentDidMount() {
        //Get Information and redirect if invalid category
        this.getInformation()
    }

    componentDidUpdate (prevProps) {
        if(this.props.match.params.api_label !== prevProps.match.params.api_label){
            this.getInformation()
        }
    }

    getInformation = async () => {
        try {
            const [category, friends, meetups] = await Promise.all
                ([
                    axiosClient.get(
                        `/api/categories/${this.props.match.params.api_label}/`, {headers: {
                            "Authorization": `JWT ${localStorage.getItem('token')}`
                        }}),
                    axiosClient.get(
                         `/api/users/${this.props.user.id}/friends/`, {params: {category: this.props.match.params.api_label} ,headers: {
                            "Authorization": `JWT ${localStorage.getItem('token')}`
                    }}),
                    axiosClient.request({
                        method: "GET",
                        url: "/api/meetups/", 
                        headers: {
                            "Authorization": `JWT ${localStorage.getItem('token')}`
                        },
                        params: {
                            type: "public",
                            categories: this.props.match.params.api_label,
                            latitude: this.props.user.settings.latitude,
                            longitude: this.props.user.settings.longitude,
                            radius: this.props.user.settings.radius
                        }
                    })
                ])
            this.setState({
                category: category.data, categoryLoaded: true, liked: category.data.preference !== null, 
                numLiked: category.data.num_liked, friends: friends.data, meetups: Object.values(meetups.data.meetups)
            })
        } catch(e){
            this.setState({loadingError: true})
        }
    }

    handleLike = async (isLike) => {
        isLike ? 
            await this.props.addPreference({category_id: this.state.category.id}, this.props.user.id) : 
            await this.props.deletePreference(this.props.user.id, this.state.category.id)
        isLike ? 
            await this.setState({liked: true, numLiked: this.state.numLiked + 1}) : 
            await this.setState({liked: false, numLiked: this.state.numLiked - 1})
    }

    render () {
        const category = this.state.category
        return (
            <div className="category">
                <div className="category-header elevate">
                    <div className="category-header-avatar">
                        <span className="category-avatar">
                            <Avatar style={{width: 100, height: 100}} src={`${process.env.REACT_APP_S3_STATIC_URL}${category.api_label}.png`} variant="square"/>
                        </span>
                        <span>{category.label}</span>
                    </div>
                    <div className="category-actions">
                        {this.state.liked ? 
                            <Tooltip title="Remove Like">
                                <IconButton color="secondary" onClick={() => this.handleLike(false)}>
                                    <FavoriteIcon/>
                                    <span className="category-actions-like" style={{color: "black"}}>{this.state.numLiked}</span> 
                                </IconButton>
                            </Tooltip>
                            :
                            <Tooltip title="Like">
                                <IconButton  onClick={() => this.handleLike(true)}>
                                    <FavoriteBorderIcon/>
                                    <span className="category-actions-like" style={{color: "#f50057"}}>{this.state.numLiked}</span> 
                                </IconButton>
                            </Tooltip>
                        }                   
                    </div>
                </div>

                <div className="category-social">
                    <div className="category-friends">
                        <div className="column">
                            <div className="column-inner">
                                <div className="column-top">
                                    <div>Friends That Like {category.label}</div>
                                    <div></div>
                                </div>
                                <div className="column-middle">
                                    {this.state.friends.map((friend) => 
                                        <Friend isUserFriend={true} friend={friend}/>
                                    )}
                                </div> 
                                <div className="column-bottom">

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="category-meetups">
                        <div style={{fontSize: "1.5rem", marginBottom: "1rem"}}>
                            Meetups Near You With <span style={{fontColor: "red"}}>{category.label} </span>Events           
                        </div>
                        <Grid container spacing={1}>
                            {this.state.meetups.map((meetup, index) =>
                                <Grid key={meetup.id} item xs={12} sm={6}>
                                    <Grow in={true} timeout={Math.max((index + 1) * 200, 500)}>
                                        <div className="meetups-cardwrapper">
                                            <MeetupCard key={meetup.id} meetup={meetup}/>
                                        </div>
                                    </Grow>
                                </Grid>
                            )}
                            
                        </Grid>
                    </div>
                </div>
                
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        user: state.user.user
    }
}

const mapDispatchToProps = {
    addPreference,
    deletePreference,
    getPublicMeetups
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoryComponent)