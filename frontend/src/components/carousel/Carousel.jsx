import React, {Component} from 'react'
import {NavigateNext, NavigateBefore} from "@material-ui/icons"
import Restauraunt from "../meetup/Restauraunt"

const Arrow = ({onClick, direction}) => { 
    return (
        <div className={`arrow ${direction}`} onClick={onClick}>  
            {direction === "left" && <NavigateBefore/>}
            {direction === "right" && <NavigateNext/>}
        </div>
    )
}

class Carousel extends Component {
    constructor(props){
        super(props)
        this.state = {
            imageIndex: 0,
            numOptions: Object.keys(this.props.options).length
        }
    }

    previousImage = (num) => {
        const currImage = num;
        const lastIndex = this.state.numOptions;
        const prevIndex = currImage === 0 ? lastIndex - 1 : num - 1

        return prevIndex;
    }

    setPreviousImage = () => {
        const nextIndex = this.previousImage(this.state.imageIndex)
        this.setState({
            imageIndex: nextIndex
        })
    }

    nextImage = (num) => {
        const currImage = num;
        const lastIndex = this.state.numOptions;
        const nextIndex = currImage === lastIndex - 1 ? 0 : currImage + 1

        return nextIndex;
    }

    setNextImage = () => {
        const prevIndex = this.nextImage(this.state.imageIndex)
        this.setState({
            imageIndex: prevIndex
        })
    }

    render () {
        const keys = Object.keys(this.props.options)
        const prev = keys[this.previousImage(this.state.imageIndex)];
        const prevPrev = keys[this.previousImage(prev)];
        const next = keys[this.nextImage(this.state.imageIndex)];
        const nextNext = keys[this.nextImage(next)];
        const curr = keys[this.state.imageIndex]

        return (
            <div className="carousel">
                <Arrow onClick={this.setPreviousImage} direction="left"/>
                {/* <Restauraunt focus={false} data={this.props.options[prevPrev]}/> */}
                <Restauraunt focus={false} data={this.props.options[prev]}/>
                <Restauraunt focus={true} data={this.props.options[curr]}/>
                <Restauraunt focus={false} data={this.props.options[next]}/>
                {/* <Restauraunt focus={false} data={this.props.options[nextNext]}/> */}
                <Arrow onClick={this.setNextImage} direction="right"/>
            </div>
        )
    }
}

export default Carousel 