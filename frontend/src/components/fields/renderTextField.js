import React from "react"
import {TextField, InputAdornment} from '@material-ui/core'

export default ({ input, label, icon = null, meta: { touched, error, warning }, ...custom }) => { 

    return (
        <>
            <TextField 
                size="small"
                fullWidth={true} 
                inputProps={{ style: {fontSize: 14}}}
                InputProps={icon && {startAdornment: (<InputAdornment>{icon}</InputAdornment>)}} 
                label={label} error={touched && (error && error.length > 0)}
                {...input} {...custom}
                helperText={touched ? error : ''}

            />
        </>
    )
}