import React from "react"
import {TextField, InputAdornment} from '@material-ui/core'

export default ({ input, label, icon = null, meta: { touched, error, warning }, ...custom }) => { 
    const customFont = {fontSize: 14, fontFamily: "Lato", fontWeight: "600"}
    const customFontSmall = {fontSize: 11, fontFamily: "Lato", fontWeight: "600", height: 15}

    return (
        <>
            <TextField 
                fullWidth={true}
                autoComplete='off' 
                inputProps={{ style: customFont}}
                InputProps={icon && {startAdornment: (<InputAdornment>{icon}</InputAdornment>)}} 
                InputLabelProps={{style: customFont}}
                FormHelperTextProps={{style: customFontSmall}}
                label={label} error={touched && (error && error.length > 0)}
                {...input} {...custom}
                helperText={
                    touched ? 
                    <span style={{height: 10}}>{error}</span> : 
                    <span style={{height: 10}}></span>
                }   
            />
        </>
    )
}