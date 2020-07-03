import React, {PureComponent} from 'react'
import {RestaurantPin, MeetupPin} from '../components'

class EntityPins extends PureComponent {
  render () {
    const {data, offset, type, hoveredIndex} = this.props;

    return data.map((entity, index) => 
      type === "restaurants" ?
        <RestaurantPin 
          number={offset + index + 1}
          identifier={`pin-${index}`} 
          hovered={hoveredIndex === offset + index + 1}
          data={entity}
        />
        :
        <MeetupPin
          number={offset + index + 1}
          identifier={`pin-${index}`} 
          hovered={hoveredIndex === offset + index + 1}
          data={entity}
        />
    )
  }
}

export default EntityPins