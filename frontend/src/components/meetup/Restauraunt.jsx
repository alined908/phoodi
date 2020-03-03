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
        this.props.socket.voteMeetupEvent({
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
                <div className="rst-action-icon">
                    {!like && <ThumbUpOutlinedIcon  className="clickable" onClick={() => this.handleClick(voteStatus.like)}/>}
                    {like && <ThumbUpIcon className="clickable" color="primary" onClick={() => this.handleClick(voteStatus.like)}/>}
                    <span className="rst-action-score">{scores[1]}</span>
                </div>
                <div className="rst-action-icon">
                    {!dislike && <ThumbDownOutlinedIcon className="clickable" onClick={() => this.handleClick(voteStatus.dislike)}/>}
                    {dislike && <ThumbDownIcon className="clickable" onClick={() => this.handleClick(voteStatus.dislike)}/>}
                    <span className="rst-action-score">{scores[2]}</span>
                </div>
                <div className="rst-action-icon">
                    {ban && <CancelIcon className="clickable" color="secondary" onClick={() => this.handleClick(voteStatus.ban)}/>}
                    {!ban && <CancelOutlinedIcon  className="clickable" onClick={() => this.handleClick(voteStatus.ban)}/>}
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
                        <span className="rst-name">{data.name}</span>
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

          let intlCode = (match[1] ? '+1 ' : '')
          return ['(', match[2], ') ', match[3], '-', match[4]].join('')
        }
        
        return null;
      }

    render (){
        const data = JSON.parse(this.props.option.option)
        const scores = this.determineNumVotes()
        const status = this.determineStatus()

        if (this.props.full) {
            return (
                <div className="rst-inner-wrapper elevate">
                    {this.renderRestauraunt(data)}
                    {this.renderActions(status, scores)}
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
        option: state.meetup.meetups[props.meetup].events[props.event].options[props.data.id]
    }
}

export default connect(mapStateToProps, null)(Restauraunt)