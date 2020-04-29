import React, {Component} from 'react'
import {connect} from 'react-redux'
import {setUserSettings} from '../../actions'
import { userPropType } from '../../constants/prop-types'
import PropTypes from "prop-types"

class LocationService extends Component {
    constructor(props){
        super(props)
        if(props.user && !props.user.settings){
            this.getUserLocation()
        }
    }

    getUserLocation = () => {
        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge:1000
        }
    
        const onSuccess = (position) => {
            const coords = {latitude: position.coords.latitude, longitude: position.coords.longitude}
            this.props.setUserSettings(coords)
        }
        
        const onError = (error) => {
            console.warn(error.message)
        }
    
        navigator.geolocation.getCurrentPosition(onSuccess, onError, options)
    }

    render(){
        return <></>
    }
}

LocationService.propTypes = {
    user: userPropType,
    setUserSettings: PropTypes.func.isRequired
}

function mapStateToProps(state) {
    return {
        user: state.user.user
    }
}

const mapDispatchToProps = {
    setUserSettings
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationService)