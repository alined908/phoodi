import React from "react"
import {TextField} from '@material-ui/core'

export default ({ input, label, meta: { touched, error }, ...custom }) => { 

    return (
        <TextField variant="outlined" style={{width: "100%"}} inputProps={{
            style: {fontSize: 14}}} label={label}
          {...input}
          {...custom}
        />
    )
}