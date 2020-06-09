import React from "react";
import { TextField, InputAdornment } from "@material-ui/core";

export default ({
  input,
  label,
  icon = null,
  meta: { touched, error, invalid, warning },
  ...custom
}) => {
  let displayError = touched && error && error.length > 0;
  let displayText = touched ? error : "";

  if ("datePicker" in custom && custom.datePicker) {
    displayText =
      displayError || invalid ? error : custom.error ? custom.helperText : "";
    displayError = displayError || invalid ? true : custom.error ? true : false;
  }

  return (
    <TextField
      variant="filled"
      size="small"
      fullWidth={true}
      autoComplete="off"
      // inputProps={{ style: customFont }}
      InputProps={
        icon && { startAdornment: <InputAdornment>{icon}</InputAdornment> },
        {disableUnderline: true}
      }
      // InputLabelProps={{ style: customFont }}
      // FormHelperTextProps={{ style: customFontSmall }}
      label={label}
      error={displayError}
      {...input}
      {...custom}
      helperText={<span style={{ color: "#f44336" }}>{displayText}</span>}
    />
  );
};
