import React, {Component} from 'react'
import {connect} from "react-redux"
import {voteStatus} from "../../constants/default-states"
import ThumbUpOutlinedIcon from '@material-ui/icons/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@material-ui/icons/ThumbDownOutlined';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import CancelIcon from '@material-ui/icons/Cancel';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import StarHalfIcon from '@material-ui/icons/StarHalf';
import RoomIcon from '@material-ui/icons/Room';
import PhoneIcon from '@material-ui/icons/Phone';
import {ADD_GLOBAL_MESSAGE} from '../../constants/action-types'
import LaunchIcon from '@material-ui/icons/Launch';

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
        const numHalfStars = rating % 1 == 0 ? 0: 1

        var stars = []

        for(var i = 0; i < numFilledStars; i++){
            stars.push(<StarIcon fontSize="inherit"></StarIcon>)
        }

        for (var i = 0; i < numHalfStars; i++){
            stars.push(<StarHalfIcon fontSize="inherit"></StarHalfIcon>)
        }

        for (var i = 0; i < numEmptyStars; i++){
            stars.push(<StarBorderIcon fontSize="inherit"></StarBorderIcon>)
        }
        return stars
    }

    handleClick = (status) => {
        //If vote is ban and option vote is not ban and option is not banned and already used ban

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
            if (this.props.user.id in this.props.option.votes && this.props.option.votes[this.props.user.id].status == status) {
                return "myclick"
            } else {
                return ""
            }
        }

        return (
            <div className="rst-actions">
                <div className={"rst-action-icon " + checkOwn(voteStatus.like)}>
                    {!like && <ThumbUpOutlinedIcon disabled={banned} className="clickable" onClick={() => this.handleClick(voteStatus.like)}/>}
                    {like && <ThumbUpIcon disabled={banned} className="clickable" color="primary" onClick={() => this.handleClick(voteStatus.like)}/>}
                    <span className="rst-action-score">{scores[1]}</span>
                </div>
                <div className={"rst-action-icon " + checkOwn(voteStatus.dislike)}>
                    {!dislike && <ThumbDownOutlinedIcon disabled={banned} className="clickable" onClick={() => this.handleClick(voteStatus.dislike)}/>}
                    {dislike && <ThumbDownIcon disabled={banned} className="clickable" onClick={() => this.handleClick(voteStatus.dislike)}/>}
                    <span className="rst-action-score">{scores[2]}</span>
                </div>
                <div className={"rst-action-icon " + checkOwn(voteStatus.ban)}>
                    {banned && <CancelIcon disabled={!ban} className="clickable" color="secondary" onClick={() => this.handleClick(voteStatus.ban)}/>}
                    {!banned && <CancelOutlinedIcon className="clickable" onClick={() => this.handleClick(voteStatus.ban)}/>}
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
                        <span >
                        <a className="rst-name" target="_blank" href={data.url}>{data.name} <LaunchIcon fontSize={"inherit"} fontWeight="inherit"/></a></span>
                        <span className="rst-rating">{this.determineRating(data.rating)}</span>
                    </div>
                    <div className="rst-img" style={{backgroundImage: `url(${data.image_url})`}}>
                    </div>
                </div>
                <div className="rst-categories">{data.price} &#8226; {data.categories.map((category) =>
                    <div className="category-chip">{category.title}</div>
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
                        <div className="rst-horz-info-entry"><RoomIcon/> {data.location.address1}, {data.location.city} {data.location.state} {data.location.zip_code}</div>
                        <div className="rst-horz-info-entry"><PhoneIcon/> {this.formatPhoneNumber(data.phone)}</div>
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