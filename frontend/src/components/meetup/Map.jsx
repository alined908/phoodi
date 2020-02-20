import React, {Component} from "react"
import ReactMapGL, {Marker, NavigationControl} from "react-map-gl"
import LocationOnIcon from '@material-ui/icons/LocationOn';

const token = "pk.eyJ1IjoiZGFuaWVsOTA4OTA4IiwiYSI6ImNrNnR6aTdtbTA0bmwzbW1ya3FncjdlcGkifQ.cBAvCpS5zDNwzyb_GUZaoA"

class Map extends Component {

    constructor(props) {
        super(props);
        this.state = {
          viewport: {
            latitude: this.props.location[0],
            longitude: this.props.location[1],
            zoom: 14.5,
            bearing: 0,
            pitch: 0
          }
        };
    }

    render() {
        return (
          <ReactMapGL
            {...this.state.viewport}
            width="450px"
            height="350px"
            mapStyle="mapbox://styles/mapbox/dark-v9"
            onViewportChange={viewport => this.setState({viewport})}
            mapboxApiAccessToken={token}
          >
            <div style={{position: 'absolute', right: 10, top: 10}}>
                <NavigationControl showCompass={false}/>
            </div>
            <Marker latitude={this.props.location[0]} longitude={this.props.location[1]} offsetLeft={-20} offsetTop={-10}>
                <LocationOnIcon fontSize="large" color="secondary"></LocationOnIcon>
            </Marker>
          </ReactMapGL>
        );
      }
}

export default Map