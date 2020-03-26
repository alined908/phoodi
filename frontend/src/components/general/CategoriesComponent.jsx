import React, {Component} from 'react'
import {axiosClient} from "../../accounts/axiosClient"
import {Avatar} from '@material-ui/core'

class CategoriesComponent extends Component {
    constructor(props){
        super(props)
        this.state = {
            category: "",
            popular: [],
            random: []
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
        console.log(popular.data.categories)
        console.log(random.data.categories)
        this.setState({popular: popular.data.categories, random: random.data.categories})
    }

    render () {
        return (
            <div className="categories-section">
                <div className="categories-horz">
                    <div className="categories-horz-description">
                        Popular Categories
                    </div>
                    <div className="categories-horz-entries">
                        {this.state.popular.map((popular) => (
                            <div classname="categories-horz-entry elevate">
                                <Avatar src={`${process.env.REACT_APP_S3_STATIC_URL}${popular.api_label}.png`} variant="square"/> {popular.label}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="categories-horz">
                    <div className="categories-horz-description">
                        Random Categories
                    </div>
                    <div className="categories-horz-entries">
                        {this.state.random.map((random) => (
                            <div classname="categories-horz-entry elevate">
                                <Avatar src={`${process.env.REACT_APP_S3_STATIC_URL}${random.api_label}.png`} variant="square"/> {random.label}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="categories-chosen">

                </div>
            </div>
        )
    }
}

export default CategoriesComponent