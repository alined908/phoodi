import React, {Component} from "react"
import ReactMapGL, {Marker, NavigationControl, FlyToInterpolator} from "react-map-gl"
import LocationOnIcon from '@material-ui/icons/LocationOn';
import * as d3 from 'd3-ease'
import PropTypes from 'prop-types'

const token = process.env.REACT_APP_MAPBOX_API_KEY;

class Map extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
          viewport: {
            latitude: this.props.location.latitude,
            longitude: this.props.location.longitude,
            zoom: 14.75,
            bearing: 0,
            pitch: 0,
          }
        };
    }

    componentDidMount(){
      this._isMounted = true;
    }

    onLoad = () => {
        const viewport = {
            ...this.state.viewport,
            zoom: 15,
            transitionDuration: 3000,
            transitionInterpolator: new FlyToInterpolator(),
            transitionEasing: d3.easeSin
        }
        if (this._isMounted){
          this.setState({viewport})
        }
    }

    componentWillUnmount() {
      this._isMounted = false;
    }

    render() {
        return (
          <ReactMapGL
            {...this.state.viewport}
            width='100%'
            height='100%'
            className="map"
            mapStyle="mapbox://styles/mapbox/streets-v11"
            onViewportChange={viewport => this.setState({viewport})}
            onLoad={this.onLoad}
            mapboxApiAccessToken={token}
          >
            <div style={{position: 'absolute', left: 10, top: 10}}>
                <NavigationControl showCompass={false}/>
            </div>
            <Marker latitude={this.props.location.latitude} longitude={this.props.location.longitude} offsetLeft={-10} offsetTop={-25}>
              <LocationOnIcon fontSize="large" color="secondary"></LocationOnIcon>
            </Marker>
          </ReactMapGL>
        );
      }
}

Map.propTypes = {
  location: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired
  })
}

export default Map