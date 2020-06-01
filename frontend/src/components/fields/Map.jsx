import React, { PureComponent, Component } from "react";
import ReactMapGL, {
  Marker,
  NavigationControl,
  Popup,
  Source,
  Layer,
  GeolocateControl,
  FlyToInterpolator
} from "react-map-gl";
import {Avatar} from '@material-ui/core'
import {Link} from 'react-router-dom'
import * as d3 from 'd3-ease'
import PropTypes from "prop-types";
import {Rating} from '../components'
import styles from '../../styles/search.module.css'
import * as turf from '@turf/turf'

const token = process.env.REACT_APP_MAPBOX_API_KEY;

const geolocateStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  margin: 10
};

const radiusToZoom = {
  5: 11.3,
  10: 10.3,
  15: 9.8,
  20: 9.4,
  25: 8.85
}

const geojson = (center, radius) => {
  let options ={
      steps: 80,
      units: 'miles'
  }

  return turf.circle(center, radius, options)
}

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
            <span className={styles.position}>
              <span className={styles.text}>{number + 1}</span>
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

class SelfPin extends Component {
  render () {
    const {latitude, longitude} = this.props
    return (
      <Marker
        longitude={longitude} 
        latitude={latitude} 
        className="mapboxgl-user-location-dot"
      />
    )
  }
}

class RestaurantPins extends PureComponent {
  render () {
    const {data, offset} = this.props;

    return data.map((restaurant, index) => 
      <RestaurantPin 
        number={offset + index}
        identifier={`pin-${index}`} 
        data={restaurant}
      />
    )
  }
}

class Map extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: this.props.location.latitude,
        longitude: this.props.location.longitude,
        zoom: this.props.zoom ? this.props.zoom : 11,
        bearing: 0,
        pitch: 0,
        transitionDuration: 3000,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: d3.easeSin
      },
      circle: geojson([props.location.longitude, props.location.latitude], this.props.radius)
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.radius !== this.props.radius){
      const viewport = {
          ...this.state.viewport,
          zoom: radiusToZoom[this.props.radius],
      }

      this.setState({
        circle: geojson([this.props.location.longitude, this.props.location.latitude], this.props.radius),
        viewport: viewport
      })
    }
  }

  onLoad = () => {
      const viewport = {
          ...this.state.viewport,
          zoom: radiusToZoom[this.props.radius]
      }
      if (this._isMounted){
        this.setState({viewport})
      }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  _updateViewport = viewport => {
    this.setState({viewport});
  };

  render() {

    return (
      <ReactMapGL
        {...this.state.viewport}
        width="100%"
        height="100%"
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onViewportChange={this._updateViewport}
        onLoad={ this.onLoad }
        mapboxApiAccessToken={token}
      >
        <Source type='geojson' data={this.state.circle}>
          <Layer 
            type='line'
            paint={{
              "line-color": "black",
              "line-opacity": 0.5,
              "line-width": 1,
              "line-offset": 5
            }}
          />
        </Source>
        <GeolocateControl
          style={geolocateStyle}
          positionOptions={{enableHighAccuracy: true}}
          trackUserLocation={true}
        />
        <RestaurantPins 
          data={this.props.markers} 
          offset={this.props.indexOffset}
        />
        <SelfPin
          latitude={this.props.location.latitude}
          longitude={this.props.location.longitude}
        />
        <div style={{ position: "absolute", right: 10, top: 10 }}>
          <NavigationControl 
            showCompass={false} 
          />
        </div>
      </ReactMapGL>
    );
  }
}

Map.propTypes = {
  location: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
  }),
};

export default Map;
