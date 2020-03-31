import React, {Component} from 'react'
import {connect} from "react-redux"
import {voteStatus} from "../../constants/default-states"
import {
    ThumbUpOutlined as ThumbUpOutlinedIcon, ThumbDownOutlined as ThumbDownOutlinedIcon, ThumbUp as ThumbUpIcon, ThumbDown as ThumbDownIcon, 
    Cancel as CancelIcon, CancelOutlined as CancelOutlinedIcon, Star as StarIcon, StarBorder as StarBorderIcon, StarHalf as StarHalfIcon, 
    Room as RoomIcon, Phone as PhoneIcon, Launch as LaunchIcon
} from '@material-ui/icons'
import {ADD_GLOBAL_MESSAGE} from '../../constants/action-types'
import {Avatar} from '@material-ui/core'
import {Tooltip} from '@material-ui/core'

class Restauraunt extends Component {

    determineNumVotes = () => {
        let scores = {1: 0, 2:0, 3:0}
        for (let key in this.props.option.votes) {
            var vote = this.props.option.votes[key]
            scores[vote.status] += 1
        }
        return scores
    }
    
    determineStatus = () => {
        const user = JSON.parse(localStorage.getItem("user")).id
        if (user in this.props.option.votes){
            return this.props.option.votes[user].status
        } 
        return 0
    }

    determineClicked = (status, option) => {
        return status === option
    }

    determineRating = (rating) => {
        const numFilledStars = Math.floor(rating)
        const numEmptyStars = Math.floor(5 - rating)
        const numHalfStars = rating % 1 === 0 ? 0: 1

        var stars = []

        for(var i = 0; i < numFilledStars; i++){
            stars.push(<StarIcon fontSize="inherit"></StarIcon>)
        }

        for (var j = 0; j < numHalfStars; j++){
            stars.push(<StarHalfIcon fontSize="inherit"></StarHalfIcon>)
        }

        for (var k = 0; k < numEmptyStars; k++){
            stars.push(<StarBorderIcon fontSize="inherit"></StarBorderIcon>)
        }
        return stars
    }

    handleClick = (status) => {
        //If vote is ban and option vote is not ban and option is not banned and already used ban
        if (!this.props.isUserMember){
            return;
        }
        this.props.socket.voteMeetupEvent({
            user: this.props.user.id,
            option: this.props.option.id, 
            status: status, 
            meetup: this.props.meetup
        })
        if (status === voteStatus.ban && !this.props.option.banned && this.props.members[this.props.user.id].ban){
            this.props.dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "Already used ban"}})
        }
        if (this.props.option.banned && ((this.props.user.id in this.props.option.votes) ? (this.props.option.votes[this.props.user.id].status !== voteStatus.ban) : true)){
            this.props.dispatch({type: ADD_GLOBAL_MESSAGE, payload: {type: "error", message: "Cant vote on banned option"}})
        }
    }

    renderActions = (status, scores, banned) => {
        const [like, dislike, ban] = [this.determineClicked(status, voteStatus.like), this.determineClicked(status, voteStatus.dislike), this.determineClicked(status, voteStatus.ban)]
        const checkOwn = (status) => {
            if (this.props.user.id in this.props.option.votes && this.props.option.votes[this.props.user.id].status === status) {
                return "myclick"
            } else {
                return ""
            }
        }

        return (
            <div className="rst-actions">
                <div className={"rst-action-icon " + checkOwn(voteStatus.like)}>
                    
                        {!like && <Tooltip title="Like"><ThumbUpOutlinedIcon disabled={banned} className="clickable" onClick={() => this.handleClick(voteStatus.like)}/></Tooltip>}
                        {like && <Tooltip title="Undo Like"><ThumbUpIcon disabled={banned} className="clickable" color="primary" onClick={() => this.handleClick(voteStatus.like)}/></Tooltip>}
                    
                    <span className="rst-action-score">{scores[1]}</span>
                </div>
                <div className={"rst-action-icon " + checkOwn(voteStatus.dislike)}>
                    
                        {!dislike && <Tooltip title="Dislike"><ThumbDownOutlinedIcon disabled={banned} className="clickable" onClick={() => this.handleClick(voteStatus.dislike)}/></Tooltip>}
                        {dislike && <Tooltip title="Undo Dislike"><ThumbDownIcon disabled={banned} className="clickable" onClick={() => this.handleClick(voteStatus.dislike)}/></Tooltip>}
                        <span className="rst-action-score">{scores[2]}</span>
                    
                </div>
                <div className={"rst-action-icon " + checkOwn(voteStatus.ban)}>
                        {!banned && <Tooltip title="Ban"><CancelOutlinedIcon className="clickable" onClick={() => this.handleClick(voteStatus.ban)}/></Tooltip>}
                        {banned && <Tooltip title="Undo Ban"><CancelIcon disabled={!ban} className="clickable" color="secondary" onClick={() => this.handleClick(voteStatus.ban)}/></Tooltip>}
                        <span className="rst-action-score">{scores[3]}</span>
                    
                </div>
            </div>
        )
    }

    renderRestauraunt = (data) => {
        return (   
            <>
                <div className="rst">
                    <div className="rst-info">
                        <span>
                            <Tooltip title="More information on Yelp page" placement="top">
                                <a className="rst-name" target="_blank" rel="noopener noreferrer" href={data.url}>
                                    {data.name} <LaunchIcon fontSize={"inherit"} fontWeight="inherit"/>
                                </a>
                            </Tooltip>
                        </span>
                        <span className="rst-rating">{this.determineRating(data.rating)}</span>
                    </div>
                    <div className="rst-img" style={{backgroundImage: `url(${data.image_url})`}}>
                    </div>
                </div>
                <div className="rst-categories">
                    {data.price} &#8226; 
                    {data.categories.map((category) =>
                        <div className="category-chip">
                            <Avatar style={{width: 20, height: 20}} src={`${process.env.REACT_APP_S3_STATIC_URL}${category.alias}.png`} variant="square">
                                <img style={{width: 20, height: 20}} src={`https://meetup-static.s3-us-west-1.amazonaws.com/static/general/panda.png`}></img>
                            </Avatar>
                            {category.title}
                        </div>
                    )}
                </div>
            </>
        )
    }

    formatPhoneNumber = (str) => {
        let cleaned = ('' + str).replace(/\D/g, '');
        let match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
        
        if (match) {
          return ['(', match[2], ') ', match[3], '-', match[4]].join('')
        }
        
        return null;
      }

    render (){
        const data = JSON.parse(this.props.option.option)
        const banned = this.props.option.banned
        const scores = this.determineNumVotes()
        const status = this.determineStatus()

        if (this.props.full) {
            return (
                <div className="center">
                    <div className={"rst-inner-wrapper elevate " + (banned ? "banned": "")}>
                        {this.renderRestauraunt(data)}
                        {this.renderActions(status, scores, banned)}
                    </div>
                </div>
            )
        } else {
            return (
                <div className="rst-horizontal">  
                    {this.renderRestauraunt(data)}
                    <div className="rst-horz-info">
                        <div className="rst-horz-info-entry">
                            <RoomIcon/> {data.location.address1}, {data.location.city} {data.location.state} {data.location.zip_code}
                        </div>
                        <div className="rst-horz-info-entry">
                            <PhoneIcon/> {this.formatPhoneNumber(data.phone)}
                        </div>
                    </div>
                </div>
            )
        }
        
    }
}

function mapStateToProps(state, props) { 
    return {
        option: state.meetup.meetups[props.meetup].events[props.event].options[props.data.id],
        members: state.meetup.meetups[props.meetup].members,
        user: state.user.user
    }
}

export default connect(mapStateToProps, null)(Restauraunt)