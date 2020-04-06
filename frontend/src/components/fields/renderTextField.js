import React from "react"
import {TextField} from '@material-ui/core'

export default ({ input, label, meta: { touched, error, warning }, ...custom }) => { 
    return (
        <>
            <TextField 
                variant="outlined" fullWidth={true} 
                inputProps={{ style: {fontSize: 14}}} 
                label={label} error={Boolean(touched && error)}
                {...input} {...custom}
                helperText={touched ? error : ''}
            />
            {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
        </>
    )
}