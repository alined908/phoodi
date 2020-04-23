import React, {Component} from 'react'
import {Select, MenuItem, FormControl, InputLabel, Button} from '@material-ui/core'
import {Location, PasswordChange, EmailChange} from '../components'
import Geocode from "react-geocode";
import {connect} from 'react-redux'
import {addSettings} from '../../actions/index'
import PropTypes from "prop-types"
import {Helmet} from 'react-helmet'

const labels = {1: "1 Mile", 5: "5 Miles", 10: "10 Miles", 15: "15 Miles", 20: "20 Miles", 25: "25 Miles"}

class SettingsComponent extends Component {
    constructor(props){
        super(props)
        this.state = {
            radius: props.settings ? props.settings.radius : null,
            location: props.settings ? props.settings.location: "",
            longitude: props.settings ? props.settings.longitude : null,
            latitude: props.settings ? props.settings.latitude: null,
        }
        this.handleClick = this.handleClick.bind(this)
        Geocode.setApiKey(`${process.env.REACT_APP_GOOGLE_API_KEY}`)
    }

    handleRadius = (e) => {
        this.setState({radius: e.target.value})
    }

    handleSubmit = (e) => {
        e.preventDefault()
        let data = {location: this.state.location, radius:this.state.radius, longitude: this.state.longitude, latitude: this.state.latitude}
        this.props.addSettings(data)
    }

    handleClick = (e, value) => {
        let location;
        if (value === null){
            location = ""
            
        } else {
            location = value.description
            Geocode.fromAddress(location).then(
                response => {
                    const geolocation = response.results[0].geometry.location
                    this.setState({longitude: geolocation.lng, latitude: geolocation.lat})
                },
                error => {
                    console.error(error);
                }
            )
        }
        this.setState({location})
    }

    render () {
        return (
            <>
                <div className="settings elevate">
                    <Helmet>
                        <meta charSet="utf-8" />
                        <title>Settings</title>
                        <meta name="description" content="Phoodie user settings" />
                    </Helmet>
                    <div className="form-header">
                        Settings
                    </div>
                    
                    <div className="">
                        <FormControl style={{width: "100%"}}>
                            <InputLabel>Max Radius</InputLabel>
                            <Select style={{maxHeight: 200}} value={this.state.radius} onChange={this.handleRadius}>
                                {Object.keys(labels).map((num) => 
                                    <MenuItem value={num}>
                                        {labels[num]}
                                    </MenuItem>
                                )}
                            </Select>
                        </FormControl>
                        
                        <div style={{marginTop: 20}}>
                            <Location label="Location" handleClick={this.handleClick} textValue={this.state.location}/>
                        </div>
                    </div>
                    <div className="settings-save">
                        <Button variant="contained" color="primary" onClick={this.handleSubmit}>Save</Button>
                    </div>
                </div>
                <PasswordChange/>
                {/* <EmailChange/> */}
            </>
        )
    }
}

SettingsComponent.propTypes = {
    settings: PropTypes.shape({
        radius: PropTypes.number,
        location: PropTypes.string,
        latitude: PropTypes.number,
        longitude: PropTypes.number
    }),
    addSettings: PropTypes.func.isRequired
}

function mapStateToProps(state){
    return {
        settings: state.user.user.settings
    }
}

const mapDispatchToProps = {
    addSettings
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsComponent)