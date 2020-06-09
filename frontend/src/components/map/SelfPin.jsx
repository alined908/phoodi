import React, {Component} from 'react'
import {Marker} from 'react-map-gl'


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

export default SelfPin