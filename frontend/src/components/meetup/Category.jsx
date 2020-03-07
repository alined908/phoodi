import React from 'react'
import {Button} from "@material-ui/core"

const Category = (props) => {
    const [variant, setVariant] = React.useState(props.clicked)

    const handleClick = () => {
        setVariant(variant === 'outlined' ? 'contained' : 'outlined')
    }

    return (
        <Button variant={variant} color="primary" onClick={() => handleClick()}>{props.category.label}</Button>
    )
}

export default Category