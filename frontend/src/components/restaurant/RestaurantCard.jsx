import React, {Component} from 'react'
import styles from '../../styles/meetup.module.css'
import {Rating} from '../components'
import { Link } from "react-router-dom";
import { Avatar, Tooltip, IconButton, Menu, MenuItem , ListItemIcon, Typography } from "@material-ui/core";
import {
    Launch as LaunchIcon,
    MoreVert as MoreVertIcon
  } from "@material-ui/icons";

class RestaurantCard extends Component {
    constructor(props){
        super(props)
        this.state = {
            hover: false,
            anchor: null
        }
    }
    
    handleMenuOpen = (e) => {
        this.setState({anchor: e.currentTarget})
      }
    
      handleMenuClose  = () => {
        this.setState({anchor: null})
      }
    

    render () {
        const data = this.props.data
        return (
            <div className={`${styles.cardWrapper} ${this.state.hover ? "elevate-2" : "elevate"}`}>
                <div 
                    className={styles.rst} 
                    onMouseEnter={() => this.setState({hover: true})} 
                    onMouseLeave={() => this.setState({hover: false})}
                >
                    <Link to={`/restaurants/${data.url}`}>
                        <img alt={data.name} className={styles.rstImg} src={data.yelp_image} />
                    </Link>
                </div>
                <div className={styles.rstCardBottom}>
                    <div className={styles.rstInfo}>
                        <div className={styles.rstInfoTop}>
                            <Rating rating={data.rating} />
                            <Tooltip title="Go To Restaurant Page" placement="top">
                                <Link to={`/restaurants/${data.url}`} className={styles.rstInfoName}>
                                <Typography variant="h6" noWrap>
                                    {data.name}
                                </Typography>
                                </Link>
                            </Tooltip>
                        </div>  
                        <div>
                            <IconButton style={{color: "rgba(10,10,10, .95)"}} edge="end" onClick={this.handleMenuOpen}>
                                <MoreVertIcon/>
                            </IconButton>
                            <Menu 
                                anchorEl={this.state.anchor} 
                                open={this.state.anchor} 
                                onClose={this.handleMenuClose}
                            >
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={data.yelp_url}
                                >
                                    <MenuItem onClick={this.handleMenuClose}>
                                        <ListItemIcon>
                                            <LaunchIcon color="primary" fontSize="small" />
                                        </ListItemIcon>
                                        <Typography variant="body2" noWrap>
                                            Go to Yelp Page
                                        </Typography>
                                    </MenuItem>
                                </a>
                            </Menu>
                        </div>
                    </div>
                <div className={styles.rstCategories}>
                    {data.price} &#8226;
                    {data.categories.map((rc) => (
                    <div key={rc.category.id} className={styles.categoryChip}>
                        <Avatar
                        style={{ width: 20, height: 20 }}
                        variant="square"
                        src={`${process.env.REACT_APP_S3_STATIC_URL}${rc.category.api_label}.png`}
                        >
                        <img
                            style={{ width: 20, height: 20 }}
                            alt={"&#9787;"}
                            src={`https://meetup-static.s3-us-west-1.amazonaws.com/static/general/panda.png`}
                        />
                        </Avatar>
                        {rc.category.label}
                    </div>
                    ))}
                </div>
            </div>
        </div>
        )
    }
}

export default RestaurantCard