import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import {TextField, Grid, Typography, makeStyles, Paper, Divider, InputBase, IconButton, ListItemAvatar, ListItemText, Avatar} from '@material-ui/core'
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import throttle from 'lodash/throttle';
import axios from 'axios'

const useStyles = makeStyles(theme => ({
  icon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2),
  },
  text : {
      fontFamily: "Lato",
      fontWeight: "600",
      fontSize: ".8rem",
      color: "black"
  }
}));

export default function RestaurauntAutocomplete(props) {
  const classes = useStyles();
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState([]);  

  const handleChange = event => {
    setInputValue(event.target.value);
  };

  const fetch = React.useMemo(
    () =>
      throttle((request, callback) => {
        var params = {
            term: request.input, 
            latitude: props.coords.latitude,
            longitude: props.coords.longitude,
            limit: 8
        }
        console.log(params)
        axios.request({
            method: "GET",
            url: 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search', 
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_YELP_API_KEY}`
            },
            params: params
        })
        .then((res) => {
          console.log(res.data)
          callback(res.data.businesses)
        })
        .catch((err) => {
          console.log ('error')
        })
      }, 200),
    [],
  );

  React.useEffect(() => {
    let active = true

    if (inputValue === '') {
      setOptions([]);
      return undefined;
    }
    
    fetch({ input: inputValue}, results => {
      if (active) {
        setOptions(results || []);
      }
    });

    return () => {
      active = false;
    };
  }, [inputValue, fetch]);

  return (
    <Autocomplete
      style={{width: "100%"}}
      getOptionLabel={option => (typeof option === 'string' ? option : option.name)}
      filterOptions={x => x}
      value={props.textValue}
      options={options}
      autoComplete
      autoHighlight
      onChange={props.handleSearchValueClick}
      includeInputInList  
      renderInput={params => (
        <TextField
          {...params}
          label={props.label}
          fullWidth
          onChange={handleChange}
        />
      )}
      renderOption={option => {
        const matches = match(option.name, inputValue)
        const parts = parse(option.name, matches)

        return (
        <>
            <ListItemAvatar>
                <Avatar variant="square" src={option.image_url}>{option.name.charAt(0)}</Avatar>
            </ListItemAvatar>
            <ListItemText 
                primary={
                    <>
                        {parts.map((part, index) => (
                            <span key={index} className={classes.text} style={{ color: part.highlight ? "red" : "black" }}>
                                {part.text}
                            </span>
                        ))}
                    </>
                } 
            >
            </ListItemText>
        </>
        );
      }}
    />
  );
}
