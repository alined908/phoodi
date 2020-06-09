import React, {Component} from 'react'
import {ButtonGroup, Button} from '@material-ui/core'
import styles from '../../styles/search.module.css'

class Prices extends Component {

    render () {
        return (
            <div className={styles.priceFilter}>
                <ButtonGroup color="primary">
                    <Button
                        variant={
                            this.props.prices[0] ? "contained" : "outlined"
                        }
                        onClick={() => this.props.onClick(0)}
                    >
                        $
                    </Button>
                    <Button
                        variant={
                            this.props.prices[1] ? "contained" : "outlined"
                        }
                        onClick={() => this.props.onClick(1)}
                    >
                        $$
                    </Button>
                    <Button
                        variant={
                            this.props.prices[2] ? "contained" : "outlined"
                        }
                        onClick={() => this.props.onClick(2)}
                    >
                        $$$
                    </Button>
                    <Button
                        variant={
                            this.props.prices[3] ? "contained" : "outlined"
                        }
                        onClick={() => this.props.onClick(3)}
                    >
                        $$$$
                    </Button>
                </ButtonGroup>
            </div>
        )
    }
}

export default Prices