import React from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import { TextField, Grid, Typography, makeStyles } from "@material-ui/core";
import parse from "autosuggest-highlight/parse";
import throttle from "lodash/throttle";
import PropTypes from "prop-types";

function loadScript(src, position, id) {
  if (!position) {
    return;
  }

  const script = document.createElement("script");
  script.setAttribute("async", "");
  script.setAttribute("id", id);
  script.src = src;
  position.appendChild(script);
}

const autocompleteService = { current: null };

const useStyles = makeStyles((theme) => ({
  icon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2),
  },
  autocomplete: {
    boxShadow: "none",
    flex: 1
  }
}));

export default function Location(props) {
  const classes = useStyles();
  const [inputValue, setInputValue] = React.useState(props.textValue || "");
  const [options, setOptions] = React.useState([]);
  const loaded = React.useRef(false);

  if (typeof window !== "undefined" && !loaded.current) {
    if (!document.querySelector("#google-maps")) {
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_API_KEY}&libraries=places`,
        document.querySelector("head"),
        "google-maps"
      );
    }

    loaded.current = true;
  }

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const fetch = React.useMemo(
    () =>
      throttle((request, callback) => {
        autocompleteService.current.getPlacePredictions(request, callback);
      }, 200),
    []
  );

  React.useEffect(() => {
    let active = true;

    if (!autocompleteService.current && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
    if (!autocompleteService.current) {
      return undefined;
    }

    if (inputValue === "") {
      setOptions([]);
      return undefined;
    }

    fetch({ input: inputValue }, (results) => {
      if (active) {
        setOptions(results || []);
      }
    });

    return () => {
      active = false;
    };
  }, [inputValue, fetch, props.textValue]);
  
  return (
    <Autocomplete
      freeSolo={props.freeSolo}
      size="small"
      className={classes.autocomplete}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.description
      }
      filterOptions={(x) => x}
      inputValue={props.textValue}
      options={options}
      autoComplete
      autoHighlight
      onChange={props.handleClick}
      onInputChange={props.handleInputChange}
      includeInputInList
      renderInput={(params) => {
        const newParams = {...params, inputProps: {...params.inputProps, value: props.textValue}}

        return (
          <TextField
            {...newParams}
            required={props.required || false}
            error={props.textValue && props.textValue.length === 0}
            label={props.label}
            variant="filled"
            fullWidth
            InputProps={{
              ...params.InputProps,
              style: {background: `${props.background}`},
              disableUnderline: true
            }}
            onChange={handleChange}
            helperText={
              props.textValue && props.textValue.length === 0
                ? "Location is required."
                : ""
            }
          />
        );
      }}
      renderOption={(option) => {
        const matches =
          option.structured_formatting.main_text_matched_substrings;
        const parts = parse(
          option.structured_formatting.main_text,
          matches.map((match) => [match.offset, match.offset + match.length])
        );

        return (
          <Grid container alignItems="center">
            <Grid item>
              <LocationOnIcon className={classes.icon} />
            </Grid>
            <Grid item xs>
              {parts.map((part, index) => (
                <span
                  key={index}
                  style={{ fontWeight: part.highlight ? 700 : 400 }}
                >
                  {part.text}
                </span>
              ))}

              <Typography variant="body2" color="textSecondary">
                {option.structured_formatting.secondary_text}
              </Typography>
            </Grid>
          </Grid>
        );
      }}
    />
  );
}

Location.propTypes = {
  textValue: PropTypes.string.isRequired,
  handleClick: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};
