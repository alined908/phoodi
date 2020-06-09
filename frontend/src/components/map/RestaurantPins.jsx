import React, {PureComponent, Component} from 'react'
import {Marker, Popup} from 'react-map-gl'
import {Avatar} from '@material-ui/core'
import {Link} from 'react-router-dom'
import {Rating} from '../components'
import styles from '../../styles/search.module.css'

class RestaurantPin extends Component {
  
    constructor(props){
      super(props)
      this.state = {
        hover: false
      }
    }
  
    render () {
  
      const {identifier, data, number} = this.props
      const restaurant = data._source
    
      return (
        <div 
          style={{position: 'relative'}}
          onMouseEnter={() => this.setState({hover: true})}
          onMouseLeave={() => this.setState({hover: false})}
        >
          <Marker 
            key={identifier} 
            longitude={restaurant.location.lon} 
            latitude={restaurant.location.lat} 
            className={styles.marker}
            offsetLeft={-20}
          >
            <Link to={`/restaurants/${restaurant.url}`}>
              <span className={`${styles.position} ${this.props.hovered ? styles.hovered : ""}`}>
                <span className={styles.text}>{number}</span>
              </span>
            </Link>
          </Marker>
          {this.state.hover &&
            <Popup 
              longitude={restaurant.location.lon} 
              latitude={restaurant.location.lat} 
              anchor="top"
              closeButton={false} 
              closeOnClick={false}
              className={styles.popup}
              offsetTop={8}
              offsetLeft={-3}
            >
              <div className={styles.mapRestaurant}>
                <div className={styles.mapImage}>
                  <div 
                    className={styles.mapRstImage} 
                    style={{backgroundImage: `url(${restaurant.yelp_image})`}}
                  />
                </div>
                <div className={styles.mapRestaurantName}>
                  {restaurant.name}
                </div>
                <div className={styles.mapRestaurantRating}>
                    <Rating readOnly={true} rating={restaurant.rating}/> &nbsp; &#8226; &nbsp;
                    {`${restaurant.rating}/10`}
                </div>
                <div className={styles.mapCategories}>
                  {restaurant.categories.map((rc) => (
                      <div key={rc.id} className={`${styles.chip} ${styles.mapChip}`}>
                          <Avatar
                              variant="square"
                              src={`${process.env.REACT_APP_S3_STATIC_URL}/static/category/${rc.api_label}.png`}
                          >
                          <img
                              alt={"&#9787;"}
                              src={`${process.env.REACT_APP_S3_STATIC_URL}/static/general/panda.png`}
                          />
                          </Avatar>
                          {rc.label}
                      </div>
                  ))}
                </div>
              </div>
            </Popup>
          }
        </div>
      )
    }
  }


class RestaurantPins extends PureComponent {
    render () {
      const {data, offset, hoveredIndex} = this.props;
  
      return data.map((restaurant, index) => 
        <RestaurantPin 
          number={offset + index + 1}
          identifier={`pin-${index}`} 
          hovered={hoveredIndex === offset + index + 1}
          data={restaurant}
        />
      )
    }
  }

export default RestaurantPins