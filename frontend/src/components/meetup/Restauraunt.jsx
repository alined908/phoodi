import React, {Component} from 'react'
import {Button} from '@material-ui/core'
import WebSocketInstance from "../../accounts/WebSocket"
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
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';

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
        WebSocketInstance.voteMeetupEvent({
            user: JSON.parse(localStorage.getItem("user")).id,
            option: this.props.option.id, 
            status: status, 
            meetup: this.props.meetup
        })
    }

    renderActions = (status, scores) => {
        const [like, dislike, ban] = [this.determineClicked(status, voteStatus.like), this.determineClicked(status, voteStatus.dislike), this.determineClicked(status, voteStatus.ban)]
        return (
            <div className="rst-actions">
                <div>
                    {!like && <ThumbUpOutlinedIcon fontSize="large" onClick={() => this.handleClick(voteStatus.like)}/>}
                    {like && <ThumbUpIcon color="primary" fontSize="large" onClick={() => this.handleClick(voteStatus.like)}/>}
                    <span className="rst-action-score">{scores[1]}</span>
                </div>
                <div>
                    {!dislike && <ThumbDownOutlinedIcon fontSize="large" onClick={() => this.handleClick(voteStatus.dislike)}/>}
                    {dislike && <ThumbDownIcon fontSize="large" onClick={() => this.handleClick(voteStatus.dislike)}/>}
                    <span className="rst-action-score">{scores[2]}</span>
                </div>
                <div>
                    {ban && <CancelIcon color="secondary" fontSize="large" onClick={() => this.handleClick(voteStatus.ban)}/>}
                    {!ban && <CancelOutlinedIcon fontSize="large" onClick={() => this.handleClick(voteStatus.ban)}/>}
                    <span className="rst-action-score">{scores[3]}</span>
                </div>
            </div>
        )
    }

    renderRestauraunt = (data) => {
        return (   
            <div>
                <div className="rst">
                    <div className="rst-info">
                        <span className="rst-name">{data.name}</span>
                        <span className="rst-rating">{this.determineRating(data.rating)}</span>
                    </div>
                    <div className="rst-img" style={{backgroundImage: `url(${data.image_url})`}}>
                    </div>
                </div>
                <div className="rst-categories">{data.price} &#8226; {data.categories.map((category) => <Chip variant="outlined" label={category.title} color="primary"></Chip>)}</div>
            </div>
        )
    }

    render (){
        const data = JSON.parse(this.props.option.option)
        const scores = this.determineNumVotes()
        const status = this.determineStatus()

        if (this.props.full) {
            return (
                <div className="rst-wrapper">
                    <div className="rst-score">
                        <div>{this.props.option.score}</div>
                    </div>
                    <div className="rst-inner-wrapper">
                        {this.renderRestauraunt(data)}
                        {this.renderActions(status, scores)}
                    </div>
                    
                </div>
            )
        } else {
            return (
                <div className="rst-horizontal">  
                    {this.renderRestauraunt(data)}
                    <div className="rst-horz-info">
                        <div>{data.location.address1}, {data.location.city} {data.location.state} {data.location.zip_code}</div>
                        <div>{data.phone}</div>
                    </div>
                </div>
            )
        }
        
    }
}

function mapStateToProps(state, props) { 
    return {
        option: state.meetup.meetups[props.meetup].events[props.event].options[props.data.id]
    }
}

export default connect(mapStateToProps, null)(Restauraunt)