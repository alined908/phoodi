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
            imageIndex: 0
        }
    }

    previousImage = (num) => {
        const currImage = num;
        const lastIndex = this.props.options.length;
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
        const lastIndex = this.props.options.length;
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
        const prev = this.previousImage(this.state.imageIndex);
        const prevPrev = this.previousImage(prev);
        const next = this.nextImage(this.state.imageIndex);
        const nextNext = this.nextImage(next);

        return (
            <div className="carousel">
                <Arrow onClick={this.setPreviousImage} direction="left"/>
                <Restauraunt focus={false} data={this.props.options[prevPrev]}/>
                <Restauraunt focus={false} data={this.props.options[prev]}/>
                <Restauraunt focus={true} data={this.props.options[this.state.imageIndex]}/>
                <Restauraunt focus={false} data={this.props.options[next]}/>
                <Restauraunt focus={false} data={this.props.options[nextNext]}/>
                <Arrow onClick={this.setNextImage} direction="right"/>
            </div>
        )
    }
}

export default Carousel 