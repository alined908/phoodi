import React from "react";
import {
  TextField,
  CircularProgress,
  Avatar,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { axiosClient } from "../../accounts/axiosClient";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import PropTypes from "prop-types";

const UserAutocomplete = (props) => {
  const [open, setOpen] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const loading = open && options.length === 0 && !loaded;

  React.useEffect(() => {
    if (!loading) {
      return undefined;
    }

    if (!loaded) {
      (async () => {
        const response = await axiosClient.get("/api/users/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setOptions(response.data);
        setLoaded(true);
      })();
    }
  }, [loading, loaded]);

  return (
    <Autocomplete
      size="small"
      style={{flex: 1}}
      className="elevate-0"
      freeSolo
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      getOptionSelected={(option, value) => option.email === value.email}
      getOptionLabel={(option) => option.email}
      options={options}
      onChange={props.handleClick}
      loading={loading}
      renderOption={(option, { inputValue }) => {
        const matchesEmail = match(option.email, inputValue);
        const matchesName = match(
          option.first_name + " " + option.last_name,
          inputValue
        );
        const partsEmail = parse(option.email, matchesEmail);
        const partsName = parse(
          option.first_name + " " + option.last_name,
          matchesName
        );

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <ListItemAvatar>
              <Avatar src={option.avatar}>
                {option.first_name.charAt(0)}
                {option.last_name.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <>
                  {partsName.map((part, index) => (
                    <span
                      key={index}
                      style={{ fontWeight: part.highlight ? 700 : 400 }}
                    >
                      {part.text}
                    </span>
                  ))}
                </>
              }
            ></ListItemText>
          </div>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search users"
          variant="filled"
          onChange={props.handleType}
          InputProps={{
            ...params.InputProps,
            disableUnderline: true,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

UserAutocomplete.propTypes = {
  handleClick: PropTypes.func.isRequired,
  handleType: PropTypes.func.isRequired,
};

export default UserAutocomplete;
