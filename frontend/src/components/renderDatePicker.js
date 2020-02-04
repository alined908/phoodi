import React from 'react';
import {DateTimePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import DateFnsUtils from "@date-io/date-fns";

export default ({ input, label, meta: { touched, invalid, error}, ...custom }) => {

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DateTimePicker
                disablePast
                label={label}
                onChange={(val) => input.onChange(val)}
                value={input.value !== '' ? input.value : null}
                showTodayButton
                clearable
                {...custom}
            />
        </MuiPickersUtilsProvider>
        
    );
}