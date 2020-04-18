import React from 'react';
import {KeyboardTimePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import DateFnsUtils from "@date-io/date-fns";
import {renderTextField} from "../components"

export default ({ input, label, meta: { touched, invalid, error}, ...custom }) => {
    var customProps = {...custom, datePicker: true}
    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardTimePicker
                disablePast
                label={label}
                onChange={(val) => input.onChange(val)}
                value={input.value !== '' ? input.value : null}
                showTodayButton
                {...customProps}
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