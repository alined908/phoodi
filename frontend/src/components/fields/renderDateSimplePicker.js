import React from 'react';
import {KeyboardDatePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import DateFnsUtils from "@date-io/date-fns";
import {renderTextField} from "../components"
import { addYears } from 'date-fns';

export default ({ input, label, meta: { touched, invalid, error}, ...custom }) => {
    var customProps = {...custom, datePicker: true}
    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
                disablePast
                label={label}
                maxDate={addYears(new Date(), 1)}
                format="MM/dd/yyyy"
                onChange={(val) => input.onChange(val)}
                value={input.value !== '' ? input.value : null}
                showTodayButton
                meta={{touched, invalid, error}}
                TextFieldComponent={renderTextField}
                clearable
                {...customProps}
            />
        </MuiPickersUtilsProvider>
        
    );
}