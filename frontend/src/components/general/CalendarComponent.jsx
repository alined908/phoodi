import React, {Component} from "react"
import {Helmet} from 'react-helmet'

class CalendarComponent extends Component {
    render () {
        return (
            <div className="calendar elevate">
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>Calendar</title>
                    <meta name="description" content="Phoodie Calendar" />
                </Helmet>   
                Coming Soon...
            </div>
        )
    }
}

export default CalendarComponent