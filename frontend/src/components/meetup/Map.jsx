import React, {Component} from "react"
import ReactMapGL, {Marker, NavigationControl, FlyToInterpolator} from "react-map-gl"
import LocationOnIcon from '@material-ui/icons/LocationOn';
import * as d3 from 'd3-ease'

const token = "pk.eyJ1IjoiZGFuaWVsOTA4OTA4IiwiYSI6ImNrNnR6aTdtbTA0bmwzbW1ya3FncjdlcGkifQ.cBAvCpS5zDNwzyb_GUZaoA"

class Map extends Component {

    constructor(props) {
        super(props);
        this.state = {
          viewport: {
            latitude: this.props.location[0],
            longitude: this.props.location[1],
            zoom: 12.5,
            bearing: 0,
            pitch: 0
          }
        };
    }

    onLoad = () => {
        const viewport = {
            ...this.state.viewport,
            zoom: 15,
            transitionDuration: 6000,
            transitionInterpolator: new FlyToInterpolator(),
            transitionEasing: d3.easeSin
        }
        this.setState({viewport})
    }


    render() {
        return (
          <ReactMapGL
            {...this.state.viewport}
            width="450px"
            height="350px"
            mapStyle="mapbox://styles/mapbox/light-v9"
            onViewportChange={viewport => this.setState({viewport})}
            onLoad={this.onLoad}
            mapboxApiAccessToken={token}
          >
            <div style={{position: 'absolute', right: 25, top: 10}}>
                <NavigationControl showCompass={false}/>
            </div>
            <Marker latitude={this.props.location[0]} longitude={this.props.location[1]}>
                <LocationOnIcon fontSize="large" color="secondary"></LocationOnIcon>
            </Marker>
          </ReactMapGL>
        );
      }
}

export default Map