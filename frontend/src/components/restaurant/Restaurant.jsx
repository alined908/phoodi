 import React, {Component} from 'react'
 import {axiosClient} from '../../accounts/axiosClient'
 import {RestaurantThread, Map} from '../components'
 import {history} from "../MeetupApp"
 import styles from '../../styles/meetup.module.css'

 class Restaurant extends Component {
    constructor(props){
        super(props)
        this.state = {
            restaurant: null
        }
    }

    async componentDidMount (){
        try {
            const response = await axiosClient.get(`/api/restaurants/${this.props.match.params.uri}/`, {headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }})
            console.log(response.data)
            this.setState({restaurant: response.data})
        } catch(e){
            console.log(e)
            history.push("/404")
        }
    }

    render () {
        const rst = this.state.restaurant
       
        return (
            <div>
                {rst && 
                    <div>
                        {rst.name}
                        <div className={styles.mapWrapper}>
                                <Map 
                                    location={{
                                        latitude: rst.latitude, 
                                        longitude: rst.longitude
                                    }}
                                />
                        </div>
                        <RestaurantThread uri={this.props.match.params.uri} restaurant={rst}/>
                    </div>
                }
            </div>
        )
    }
 }

 export default Restaurant