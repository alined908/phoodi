import React, {Component} from 'react'
import styles from "../../styles/utils.module.css"

class DisplayRating extends Component {

    render() {
        return (
            <div className={styles.displayRating}>
                <span className={styles.star}>&#9733;</span> 
                {this.props.score}
            </div>
        )
    }

}

export default DisplayRating