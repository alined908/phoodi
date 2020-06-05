import React, { Component } from "react";
import ReactMapGL, {
  NavigationControl,
  GeolocateControl,
  FlyToInterpolator
} from "react-map-gl";
import {SelfPin} from '../components'
import * as d3 from 'd3-ease'

const token = process.env.REACT_APP_MAPBOX_API_KEY;

const geolocateStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    margin: 10
  };

class StaticMap extends Component {
    _isMounted = false;
    constructor(props) {
      super(props);
      this.state = {
        viewport: {
          latitude: this.props.location.latitude,
          longitude: this.props.location.longitude,
          zoom: this.props.zoom ? this.props.zoom : 13,
          transitionDuration: 5000,
          transitionInterpolator: new FlyToInterpolator(),
          transitionEasing: d3.easeCubic
        },
      };
    }
  
    componentDidMount() {
      this._isMounted = true;
    }
  
    onLoad = () => {
        const viewport = {
            ...this.state.viewport,
            zoom: 14.5
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
          <GeolocateControl
            style={geolocateStyle}
            positionOptions={{enableHighAccuracy: true}}
            trackUserLocation={true}
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

export default StaticMap