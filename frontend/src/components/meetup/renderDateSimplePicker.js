import React from 'react';
import {DatePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import DateFnsUtils from "@date-io/date-fns";
import moment from "moment"

export default ({ input, label, meta: { touched, invalid, error}, ...custom }) => {

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DatePicker
                disablePast
                label={label}
                onChange={(val) => input.onChange(val)}
                value={input.value !== '' ? input.value : null}
                showTodayButton
                inputVariant="outlined"
                style={{width: "100%"}} 
                inputProps={{style: {fontSize: 14}}} 
                clearable
                {...custom}
            />
        </MuiPickersUtilsProvider>
        
    );
}