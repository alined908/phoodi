import React, {Component} from 'react';
import {ReactComponent as AccidentIcon} from "../../assets/svgs/accident.svg"
import {history} from '../MeetupApp'
import styles from '../../styles/general.module.css'

class ErrorPage extends Component {
    handleClick = () => {
        history.goBack()
    }

    render () {
        return(
            <div className={styles.errorPage}>
                <div className={styles.errorPageIcon}>
                    <AccidentIcon width="100%" height="100%"/>
                </div>
                <div className={styles.errorPageMessage}>
                    <div>Error code: 404</div>
                    <div>We weren't able to find the page!</div>
                    <div onClick={this.handleClick}>Try Again</div>
                </div>
            </div>
        )
    }
}

export default ErrorPage