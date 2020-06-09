import React, {Component} from 'react'
import {Skeleton} from '@material-ui/lab'
import styles from '../../styles/search.module.css'

class SkeletonRestaurant extends Component {
    render() {
        return (
            <div className={styles.skeletonRestaurant}>
                <div className={styles.skeletonImage}>
                    <Skeleton animation="wave" variant="rect" height='100%'/>
                </div>
                <div className={styles.skeletonSide}>
                    <div className={styles.skeletonTop}>
                        <div className={styles.skeletonInfo}>
                            <div className={styles.skeletonName}>
                                <Skeleton animation="wave" variant="rect" height='100%'/>
                            </div>
                            <div className={styles.skeletonRating}>
                                <Skeleton animation="wave" variant="rect" height='100%'/>
                            </div>
                        </div>
                        <div className={styles.skeletonContact}>
                            <div className={styles.skeletonPhone}>
                                <Skeleton animation="wave" variant="rect" height='100%'/>
                            </div>
                            <div className={styles.skeletonAddress}>
                                <Skeleton animation="wave" variant="rect" height='100%'/>
                            </div>
                            <div className={styles.skeletonCity}>
                                <Skeleton animation="wave" variant="rect" height='100%'/>
                            </div>
                        </div>
                    </div>
                    <div className={styles.skeletonMiddle}>
                        <Skeleton animation="wave" variant="rect" height='100%'/>
                    </div>
                    <div className={styles.skeletonBottom}>
                        <div className={styles.skeletonCategories}>
                            <Skeleton animation="wave" variant="rect" height='100%'/>
                        </div>
                        <div className={styles.skeletonStats}>
                            <Skeleton animation="wave" variant="rect" height='100%'/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default SkeletonRestaurant