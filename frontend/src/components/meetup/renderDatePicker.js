import React from 'react';
import {DateTimePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import DateFnsUtils from "@date-io/date-fns";
import moment from 'moment'

export default ({ input, label, meta: { touched, invalid, error}, ...props }) => {

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DateTimePicker
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
                format="MMMM d - hh:mm a"
            />
        </MuiPickersUtilsProvider>
        
    );
}