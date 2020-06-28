import React, {Component} from 'react'
import {Marker, Popup} from 'react-map-gl'
import {Avatar} from '@material-ui/core'
import {Link} from 'react-router-dom'
import styles from '../../styles/search.module.css'

class MeetupPin extends Component {

    constructor(props){
        super(props)
        this.state = {
          hover: false
        }
      }
    
      render () {
    
        const {identifier, data, number} = this.props
        const meetup = data
      
        return (
          <div 
            style={{position: 'relative'}}
            onMouseEnter={() => this.setState({hover: true})}
            onMouseLeave={() => this.setState({hover: false})}
          >
            <Marker 
              key={identifier} 
              longitude={meetup.longitude} 
              latitude={meetup.latitude} 
              className={styles.marker}
              offsetLeft={-20}
            >
              <Link to={`/meetups/${meetup.uri}`}>
                <span className={`${styles.position} ${this.props.hovered ? styles.hovered : ""}`}>
                  <span className={styles.text}>{number}</span>
                </span>
              </Link>
            </Marker>
            {this.state.hover &&
              <Popup 
                longitude={meetup.longitude} 
                latitude={meetup.latitude} 
                anchor="top"
                closeButton={false} 
                closeOnClick={false}
                className={styles.popup}
                offsetTop={8}
                offsetLeft={-3}
              >
                <div className={styles.mapRestaurant}>
                  <div className={styles.mapRestaurantName}>
                    {meetup.name}
                  </div>
                </div>
              </Popup>
            }
          </div>
        )
      }
}

export default MeetupPin