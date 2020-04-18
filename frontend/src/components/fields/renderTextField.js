import React from "react"
import {TextField, InputAdornment} from '@material-ui/core'

export default ({ input, label, icon = null, meta: { touched, error, invalid, warning}, ...custom }) => { 
    const customFont = {fontSize: 14, fontFamily: "Lato", fontWeight: "600"}
    const customFontSmall = {fontSize: 11, fontFamily: "Lato", fontWeight: "600", height: 15}
    var displayError = touched && (error && error.length > 0)
    var displayText = touched ? error : ""

    if("datePicker" in custom && custom.datePicker){
        displayText = (displayError || invalid) ? error : (custom.error ? custom.helperText : "")
        displayError = (displayError || invalid) ? true : (custom.error ? true : false)
    }

    return (
        <TextField 
            fullWidth={true}
            autoComplete='off' 
            inputProps={{ style: customFont}}
            InputProps={icon && {startAdornment: (<InputAdornment>{icon}</InputAdornment>)}} 
            InputLabelProps={{style: customFont}}
            FormHelperTextProps={{style: customFontSmall}}
            label={label} error={displayError}
            {...input} {...custom}
            helperText={<span>{displayText}</span>}   
        />
    )
}