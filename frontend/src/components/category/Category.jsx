import React, {Component} from "react"
import {axiosClient} from '../../accounts/axiosClient'
import {Avatar, Tooltip, IconButton, Grid, Grow} from '@material-ui/core'
import {getMeetups, getFriends, addPreference, deletePreference} from "../../actions";
import {Friend, MeetupCard} from '../components'
import {FavoriteBorder as FavoriteBorderIcon, Favorite as FavoriteIcon} from '@material-ui/icons';
import {connect} from 'react-redux'
import PropTypes from "prop-types"
import {userPropType} from "../../constants/prop-types"
import {Helmet} from 'react-helmet'
import {history} from '../MeetupApp'
import moment from 'moment'
import styles from '../../styles/category.module.css'

class Category extends Component {
    constructor(props){
        super(props)
        this.state = {
            category: {},
            restaurants: [],
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
            const [category, restaurants] = await Promise.all(
                [
                    axiosClient.get(
                        `/api/categories/${this.props.match.params.api_label}/`, {headers: {
                            "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }}),
                    axiosClient.request({
                        method: "GET",
                        url: `/api/restaurants/`,
                        headers : {
                            "Authorization": `Bearer ${localStorage.getItem('token')}`
                        },
                        params: {
                            category: this.props.match.params.api_label,
                            latitude: this.props.user.settings ? this.props.user.settings.latitude: null,
                            longitude: this.props.user.settings ? this.props.user.settings.longitude: null,
                            radius: this.props.user.settings ? this.props.user.settings.radius : 25
                        }
                    }),
                    this.props.getFriends(this.props.user.id, this.props.match.params.api_label),
                    this.props.getMeetups({
                        type: "public",
                        startDate: moment().format("YYYY-MM-DD"),
                        endDate: moment().add(7, 'd').format("YYYY-MM-DD"),
                        categories: this.props.match.params.api_label, 
                        coords: {...this.props.user.settings}
                    })
                ]
            )
            this.setState({
                category: category.data, categoryLoaded: true, liked: category.data.preference !== null, 
                numLiked: category.data.num_liked, restaurants: restaurants.data
            })
        } catch(e){
            history.push('/404')
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
            <div className={styles.category}>
                <Helmet>
                    <meta charSet="utf-8" />
                    <meta name="description" content="Discover new categories." />
                    <title>{`Discover ${category.label === undefined ? "" : category.label}`}</title>
                </Helmet>
                <div className={styles.header}>
                    <div className={styles.headerAvatar}>
                        <span className={styles.avatar}>
                            <Avatar 
                                variant="square"
                                className={styles.categoryAvatar}
                                src={`${process.env.REACT_APP_S3_STATIC_URL}${category.api_label}.png`} 
                            />
                        </span>
                        <span>{category.label}</span>
                    </div>
                    <div className={styles.actions}>
                        {this.state.liked ? 
                            <Tooltip title="Remove Like">
                                <IconButton color="secondary" onClick={() => this.handleLike(false)}>
                                    <FavoriteIcon/>
                                    <span className={styles.actionLike} style={{color: "black"}}>
                                        {this.state.numLiked}
                                    </span> 
                                </IconButton>
                            </Tooltip>
                            :
                            <Tooltip title="Like">
                                <IconButton  onClick={() => this.handleLike(true)}>
                                    <FavoriteBorderIcon/>
                                    <span className={styles.actionLike} style={{color: "#f50057"}}>
                                        {this.state.numLiked}
                                    </span> 
                                </IconButton>
                            </Tooltip>
                        }                   
                    </div>
                </div>
                <div>
                    {this.state.restaurants.map((rst) => 
                        <div>
                            {rst.name}
                        </div>
                    )}
                </div>
                <div className={styles.social}>
                    <div className={styles.friends}>
                        <div className="column">
                            <div className="column-inner">
                                <div className="column-top">
                                    <div>Friends That Like {category.label}</div>
                                    <div></div>
                                </div>
                                <div className="column-middle">
                                    {this.props.friends.map((friend) => 
                                        <Friend key={friend.id} isUserFriend={true} friend={friend}/>
                                    )}
                                </div> 
                              
                            </div>
                        </div>
                    </div>
                    <div className={styles.meetups}>
                        <div className={styles.headerTitle}>
                            Meetups Near You With <span className={styles.categoryHighlight}>{category.label}</span> Events           
                        </div>
                        <Grid container spacing={1}>
                            {Object.keys(this.props.meetups).map((uri, index) =>
                                <Grid key={this.props.meetups[uri].id} item xs={12} lg={6} >
                                    <Grow in={true} timeout={Math.max((index + 1) * 200, 500)}>
                                        <div className="meetups-cardwrapper">
                                            <MeetupCard meetup={this.props.meetups[uri]}/>
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

Category.propTypes = {
    user: userPropType,
    addPreference: PropTypes.func.isRequired,
    deletePreference: PropTypes.func.isRequired,
    match: PropTypes.shape({
        params: PropTypes.shape({
          api_label: PropTypes.string.isRequired
        })
    }),
}

function mapStateToProps(state){
    return {
        user: state.user.user,
        meetups: state.meetup.meetups,
        friends: state.user.friends
    }
}

const mapDispatchToProps = {
    addPreference,
    deletePreference,
    getMeetups,
    getFriends
}

export default connect(mapStateToProps, mapDispatchToProps)(Category)