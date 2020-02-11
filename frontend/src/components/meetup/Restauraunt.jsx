import React, {Component} from 'react'
import {Button} from '@material-ui/core'

class Restauraunt extends Component {
    render (){
        const data = JSON.parse(this.props.data.option)
        
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
                <div className="rst-actions">
                    <Button style={this.props.focus ? {'display': "block"} : {'display': 'none'}} size="small" variant="contained" color="primary">Like</Button>
                    <Button style={this.props.focus ? {'display': "block"} : {'display': 'none'}} size="small" variant="contained" color="secondary">Ban</Button>
                </div>
            </div>
        )
    }
}

export default Restauraunt