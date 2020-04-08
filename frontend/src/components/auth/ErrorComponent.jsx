import React, {Component} from 'react';
import {ReactComponent as AccidentIcon} from "../../assets/svgs/accident.svg"

class ErrorComponent extends Component {
    render () {
        return(
            <div className="error-page">
                <div className="error-page-icon"><AccidentIcon width="100%" height="100%"/></div>
                <div className="error-page-message">
                    <div>&#x2639; - Error code: 404</div>
                    <div>We weren't able to find the page!</div>
                </div>
            </div>
        )
    }
}

export default ErrorComponent