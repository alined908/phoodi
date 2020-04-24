import React, {Component} from 'react'
import {axiosClient} from '../../accounts/axiosClient'
import { RestaurantReviewForm, RestaurantReview} from '../components'
import {Button} from '@material-ui/core'
import {history} from '../MeetupApp'
import PropTypes from 'prop-types'
import styles from '../../styles/meetup.module.css'

class RestaurantThread extends Component {
    constructor(props){
        super(props)
        this.state = {
            reviews: [],
            reviewForm: false
        }
    }

    async componentDidMount(){
        try {
            const response = await axiosClient.get(`/api/restaurants/${this.props.uri}/reviews/`, {headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }})
            console.log(response.data)
            this.setState({reviews: response.data})
        } catch(e) {
            console.log(e)
            history.push('/404')
        }
    }

    displayOnSuccess = (review) => {
        this.setState({reviews: [review, ...this.state.reviews]})
    }

    openFormModal = () => {
        this.setState({reviewForm: !this.state.reviewForm})
    }

    render () {
        const reviews = this.state.reviews
        console.log(this.props.restaurant)
        return (
            <div>
                <Button onClick={this.openFormModal} color="primary">
                    Add Review
                </Button>
                {reviews.map((review) => 
                    <RestaurantReview review={review} restaurant={this.props.restaurant}/>
                )}

                {this.state.reviewForm && <RestaurantReviewForm 
                    restaurant={this.props.restaurant} 
                    displayOnSuccess={this.displayOnSuccess}
                    handleClose={this.openFormModal}
                />}
            </div>
        )
    }
}

RestaurantThread.propTypes = {
    uri: PropTypes.string.isRequired
}

export default RestaurantThread