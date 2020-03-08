import React from 'react';
import {KeyboardTimePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import DateFnsUtils from "@date-io/date-fns";

export default ({ input, label, meta: { touched, invalid, error}, ...props }) => {

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardTimePicker
                disablePast
                label={label}
                onChange={(val) => input.onChange(val)}
                value={input.value !== '' ? input.value : null}
                showTodayButton
                {...props}
                inputVariant="outlined"
                style={{width: "100%"}} 
                minutesStep={5}
                inputProps={{style: {fontSize: 14}}} 
                clearable
                format="hh:mm a"
            />
        </MuiPickersUtilsProvider>
        
    );
}