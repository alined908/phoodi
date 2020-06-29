import React, {Component} from 'react'
import {Marker, Popup} from 'react-map-gl'
import {Today as TodayIcon, LocationOn as LocationOnIcon, People as PeopleIcon} from '@material-ui/icons'
import {Link} from 'react-router-dom'
import styles from '../../styles/search.module.css'
import moment from 'moment'

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
        const users = [];
        console.log(meetup)
        
      
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
                  <div className={styles.mapMeetupName}>
                    {meetup.name}
                  </div>
                  <div className={styles.mapMeetupEntry}>
                    <TodayIcon /> <span className={styles.mapMeetupInfo}>{moment(meetup.date).local().format("dddd, MMMM D")}</span>
                  </div>
                  <div className={styles.mapMeetupEntry}>
                    <LocationOnIcon/> <span className={styles.mapMeetupInfo}>{meetup.location}</span>
                  </div>
                  <div className={styles.mapMeetupEntry}>
                    <PeopleIcon/> <span className={styles.mapMeetupInfo}>{Object.values(meetup.members).length} members</span>
                  </div>
                </div>
              </Popup>
            }
          </div>
        )
      }
}

export default MeetupPin