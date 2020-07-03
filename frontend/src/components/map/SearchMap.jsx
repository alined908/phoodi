import React, { Component } from "react";
import ReactMapGL, {
  NavigationControl,
  Source,
  Layer,
  GeolocateControl,
  FlyToInterpolator
} from "react-map-gl";
import {SelfPin, EntityPins} from '../components'
import * as d3 from 'd3-ease'
import PropTypes from "prop-types";
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

class SearchMap extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        latitude: this.props.location.latitude,
        longitude: this.props.location.longitude,
        zoom: this.props.zoom ? this.props.zoom : 11,
        transitionDuration: 5000,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: d3.easeCubic
      },
      circle: geojson([props.location.longitude, props.location.latitude], this.props.radius)
    };
  }

  componentDidMount() {
    console.log('mounts ')
    this._isMounted = true;
  }

  componentDidUpdate(prevProps, prevState) {
    
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

    if (
      prevProps.location.latitude !== this.props.location.latitude || 
      prevProps.location.longitude !== this.props.location.longitude || 
      this.state.latitude !== prevState.latitude || 
      this.state.longitude !== prevState.longitude
    ) {

      const viewport = {
        ...this.state.viewport,
        latitude: this.props.location.latitude,
        longitude: this.props.location.longitude,
        zoom: radiusToZoom[this.props.radius],
        transitionDuration: 5000,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: d3.easeCubic
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
        <EntityPins 
          data={this.props.markers}
          type={this.props.type}
          offset={this.props.indexOffset}
          hoveredIndex={this.props.hoveredIndex}
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

export default SearchMap;
