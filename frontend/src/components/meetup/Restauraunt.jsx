import React, {Component} from 'react'
import {Button} from '@material-ui/core'
import WebSocketInstance from "../../accounts/WebSocket"
import {connect} from "react-redux"
import {voteStatus} from "../../constants/default-states"

class Restauraunt extends Component {
    constructor(props){
        super(props)
    }

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

    determineVariant = (status, option) => {
        return status === option ? "contained" : "outlined"
    }

    handleClick = (status) => {
        WebSocketInstance.voteMeetupEvent({
            user: JSON.parse(localStorage.getItem("user")).id,
            option: this.props.option.id, 
            status: status, 
            meetup: this.props.meetup
        })
    }

    render (){
        const data = JSON.parse(this.props.option.option)
        const scores = this.determineNumVotes()
        const status = this.determineStatus()

        return (
            <div className="rst-wrapper">
                
                    <div className="rst-score">
                        <div>{this.props.option.score}</div>
                    </div>
                    <div className="rst-inner-wrapper">
                        <div className="rst">
                            <div className="rst-info">
                                <span className="rst-name">{data.name}</span>
                                <span className="rst-rating">{data.rating}</span>
                            </div>
                            <div className="rst-img" style={{backgroundImage: `url(${data.image_url})`}}>
                            </div>  
                        </div>
                        <div className="rst-actions">
                            <div><Button onClick={() => this.handleClick(voteStatus.like)} size="small" variant={this.determineVariant(status, voteStatus.like)} color="primary">Like</Button> {scores[1]}</div>
                            <div><Button onClick={() => this.handleClick(voteStatus.dislike)} size="small" variant={this.determineVariant(status, voteStatus.dislike)} color="primary">Dislike</Button> {scores[2]}</div>
                            <div><Button onClick={() => this.handleClick(voteStatus.ban)} size="small" variant={this.determineVariant(status, voteStatus.ban)} color="secondary">Ban</Button> {scores[3]}</div>
                        </div>
                    </div>
                
            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {
        option: state.meetup.meetups[props.meetup].events[props.event].options[props.data.id]
    }
}

export default connect(mapStateToProps, null)(Restauraunt)