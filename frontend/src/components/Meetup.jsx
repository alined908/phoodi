import React, {Component} from 'react'
import Restauraunt from "./Restauraunt"
import {connect} from 'react-redux';
import {deleteMeetup} from '../actions/meetup';

class Meetup extends Component {
    
    handleDelete = (uri) => {
        this.props.deleteMeetup(uri);
    }

    render () {
        var choices = {}
        var valid = false;
        const [id, uri, location, datetime, options, chosen, members] = this.props.meetup
        if (options !== ""){
            choices = JSON.parse(options);
            valid = true
            console.log(choices)
        }
        
        return (
            <div className="meetup">
                <button onClick={() => this.handleDelete(uri)}>Delete Meetup</button>
                <div>{id}-{datetime}</div>
                <div>{location}</div>
                <div>{Object.keys(members).map((key) => Object.values(members[key]))}</div>
                <div className="rsts">
                    {valid && choices.businesses.map((rest) => 
                        <Restauraunt data={rest}/>
                    )}
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = {
    deleteMeetup
}

export default connect(null, mapDispatchToProps)(Meetup)