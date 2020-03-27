import React, {Component} from 'react'
import {axiosClient} from "../../accounts/axiosClient"
import {Avatar, IconButton, Tooltip, Grow} from '@material-ui/core'
import Skeleton from '@material-ui/lab/Skeleton';
import CachedIcon from '@material-ui/icons/Cached';
import {Link} from 'react-router-dom'

class CategoriesComponent extends Component {
    constructor(props){
        super(props)
        this.state = {
            category: "",
            popular: [],
            random: [],
            popularCategoriesLoaded: false,
            randomCategoriesLoaded: false
        }
    }

    async componentDidMount(){
        const [popular, random] = await Promise.all(
            [
                axiosClient.get(
                    `/api/categories/?popular=true`, {headers: {
                        "Authorization": `JWT ${localStorage.getItem('token')}`
                }}),
                axiosClient.get(
                    `/api/categories/?random=true`, {headers: {
                        "Authorization": `JWT ${localStorage.getItem('token')}`
                }}),
            ]
        )
        this.setState({popular: popular.data.categories, random: random.data.categories, popularCategoriesLoaded: true,  randomCategoriesLoaded: true})
    }

    handleReload = async () => {
        this.setState({randomCategoriesLoaded: false})

        const response = await axiosClient.get(
            `/api/categories/?random=true`, {headers: {
                "Authorization": `JWT ${localStorage.getItem('token')}`
        }})
        this.setState({random: response.data.categories, randomCategoriesLoaded: true})
    }

    render () {
        return (
            <div className="categories-section">
                <div className="categories-horz">
                    <div className="categories-horz-description">
                        Most Popular Categories
                    </div>
                    <div className="categories-horz-entries">
                        {this.state.popularCategoriesLoaded ? 
                            this.state.popular.map((popular, index) => (
                                <Grow in={true} timeout={Math.max((index + 1) * 70)}>
                                    <Link to={`/category/${popular.api_label}`}>
                                        <div className="categories-horz-entry elevate">
                                            <Avatar src={`${process.env.REACT_APP_S3_STATIC_URL}${popular.api_label}.png`} variant="square"/> {popular.label}
                                        </div>
                                    </Link>
                                </Grow>
                            )) :
                            [...Array(16).keys()].map((each) => (
                                <div className="categories-horz-placeholder elevate">
                                    <Skeleton animation="wave" variant="circle" height={40} width={40}/>
                                    <Skeleton animation="wave" height={10} width={60} style={{ marginLeft: 10 }} />
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className="categories-horz">
                    <div className="categories-horz-description">
                        Discover New Categories 
                        <Tooltip title="Reload">
                            <IconButton onClick={this.handleReload} color="primary">
                                <CachedIcon></CachedIcon>
                            </IconButton>
                        </Tooltip>
                    </div>
                    <div className="categories-horz-entries">
                        {this.state.randomCategoriesLoaded ? 
                            this.state.random.map((random, index) => (
                                <Grow in={true} timeout={Math.max((index + 1) * 70)}>
                                    <Link to={`/category/${random.api_label}`}>
                                        <div className="categories-horz-entry elevate">
                                            <Avatar src={`${process.env.REACT_APP_S3_STATIC_URL}${random.api_label}.png`} variant="square"/> {random.label}
                                        </div>
                                    </Link>
                                </Grow>
                            )) :
                            [...Array(26).keys()].map((each) => (
                                <div className="categories-horz-placeholder elevate">
                                    <Skeleton animation="wave" variant="circle" height={40} width={40}/>
                                    <Skeleton animation="wave" height={10} width={60} style={{ marginLeft: 10 }} />
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default CategoriesComponent