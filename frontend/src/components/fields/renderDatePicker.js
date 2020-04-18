import React from 'react';
import {KeyboardTimePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import DateFnsUtils from "@date-io/date-fns";
import {renderTextField} from "../components"

export default ({ input, label, meta: { touched, invalid, error}, ...custom }) => {
    console.log(custom)
    console.log(touched)
    console.log(invalid)
    console.log(error)
    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardTimePicker
                disablePast
                label={label}
                onChange={(val) => input.onChange(val)}
                value={input.value !== '' ? input.value : null}
                showTodayButton
                {...custom}
                style={{width: "100%"}} 
                meta={{touched, invalid, error}}
                minutesStep={5}
                TextFieldComponent={renderTextField}
                clearable
                format="hh:mm a"
            />
        </MuiPickersUtilsProvider>
        
    );
}