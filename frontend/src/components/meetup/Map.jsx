import React, {Component} from "react"
import ReactMapGL, {Marker, NavigationControl, FlyToInterpolator} from "react-map-gl"
import LocationOnIcon from '@material-ui/icons/LocationOn';
import * as d3 from 'd3-ease'

const token = process.env.REACT_APP_MAPBOX_API_KEY;

class Map extends Component {

    constructor(props) {
        super(props);
        this.state = {
          viewport: {
            latitude: this.props.location[0],
            longitude: this.props.location[1],
            zoom: 15,
            bearing: 0,
            pitch: 0,
          }
        };
    }

    onLoad = () => {
        const viewport = {
            ...this.state.viewport,
            zoom: 15,
            transitionDuration: 5000,
            transitionInterpolator: new FlyToInterpolator(),
            transitionEasing: d3.easeSin
        }
        this.setState({viewport})
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
            // onLoad={this.onLoad}
            mapboxApiAccessToken={token}
          >
            <div style={{position: 'absolute', left: 10, top: 10}}>
                <NavigationControl showCompass={false}/>
            </div>
            <Marker latitude={this.props.location[0]} longitude={this.props.location[1]} offsetLeft={-10} offsetTop={-25}>
              <LocationOnIcon fontSize="large" color="secondary"></LocationOnIcon>
            </Marker>
          </ReactMapGL>
        );
      }
}

export default Map