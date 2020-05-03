import React, {Component} from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css'

class Rating extends Component {

    getGreen = () => {
        return (10 - this.props.rating) / 10 * 255
    }

    render () {
        return (
            <div style={{width: 40, height: 40}}>
                <CircularProgressbar
                    value={this.props.rating * 10} 
                    text={this.props.rating}
                    styles={
                        buildStyles({
                            textSize: '40px',
                            pathColor:`rgba(255, ${this.getGreen()} , 0 , .7)`,
                            trailColor: '#f9f9f9',
                            textColor: `black`,
                        })
                    }
                /> 
            </div>
        )
    }
}

export default Rating