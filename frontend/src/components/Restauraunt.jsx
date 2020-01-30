import React, {Component} from 'react'

class Restauraunt extends Component {
    render (){
        const data = this.props.data

        return (
            <div className="rst-wrapper">
                <div className="rst">
                    <div className="rst-info">
                        <span className="rst-name">{data.name}</span>
                        <span className="rst-rating">{data.rating}</span>
                    </div>
                    <div className="rst-img" style={{backgroundImage: `url(${data.image_url})`}}>

                    </div>
                </div>
            </div>
        )
    }
}

export default Restauraunt