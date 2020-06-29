import React, {Component} from 'react'
import styles from '../../styles/search.module.css'
import {Rating} from '../components'
import { Link } from "react-router-dom";
import { Avatar } from "@material-ui/core";
import {Grade as GradeIcon, Comment as CommentIcon, Event as EventIcon} from '@material-ui/icons'

const convertPriceToChips = price => {
    return '$'.repeat(price)
}

class RestaurantCard extends Component {

    handleHover = (index) => {
        this.props.onHover(index)
    }
  
    render () {
        const data = this.props.data
        return (
            <Link to={`/restaurants/${data.url}`}>
                <div 
                    className={styles.cardWrapper}
                    onMouseEnter={() => this.handleHover(this.props.index + 1)}
                    onMouseLeave={() => this.handleHover(null)}
                >
                    <div className={styles.rst} >
                        <div className={styles.rstImg} style={{backgroundImage: `url(${data.yelp_image})`}}>

                        </div>
                    </div>
                    <div className={styles.rstCardTop}>
                        <div className={styles.rstTop}>
                            <div className={styles.rstImportant}>
                                <div className={styles.rstName}>
                                    {`${this.props.index + 1}. ${data.name}`}
                                </div>
                                <div className={styles.rstRating}>
                                    <Rating readOnly={true} rating={data.rating}/> &nbsp; &#8226; &nbsp;
                                    {`${data.rating}/10`}
                                </div>
                            </div>  
                            <div className={styles.rstInfo}>
                                <div>
                                    {data.phone}
                                </div>
                                <div>
                                    {data.address1}
                                </div>
                                <div>
                                    {`${data.city}, ${data.state}`}
                                </div>
                            </div>
                        </div>
                        <div className={styles.rstCardBottom}>
                            <div className={styles.rstCategories}>
                                {convertPriceToChips(data.price)} &#8226;
                                {data.categories.map((rc) => (
                                    <div key={rc.id} className={`${styles.rstCategory} blockActionChip`}>
                                        <Avatar
                                            variant="square"
                                            src={`${process.env.REACT_APP_S3_STATIC_URL}/static/category/${rc.api_label}.png`}
                                        >
                                        <img
                                            alt={"&#9787;"}
                                            src={`${process.env.REACT_APP_S3_STATIC_URL}/static/general/panda.png`}
                                        />
                                        </Avatar>
                                        {rc.label}
                                    </div>
                                ))}
                            </div>
                            <div className={styles.rstStats}>
                                <span className={styles.rstStat}>
                                    <GradeIcon color="primary" fontSize="small"/> {data.review_count}
                                </span>
                                <span className={styles.rstStat}>
                                    <CommentIcon color="primary" fontSize="small"/> {data.comment_count}
                                </span>
                                <span className={styles.rstStat}>
                                    <EventIcon color="primary" fontSize="small"/> {data.option_count}
                                </span>
                            </div>
                        </div>
                        
                </div>
            </div>
        </Link>
        )
    }
}

export default RestaurantCard