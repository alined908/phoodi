import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {TextField, makeStyles, ListItemAvatar, ListItemText, Avatar} from '@material-ui/core'
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import throttle from 'lodash/throttle';
import axios from 'axios'

const useStyles = makeStyles({
  text : {
      fontFamily: "Lato",
      fontWeight: "600",
      fontSize: ".8rem",
      color: "black"
  },
  root: {
    background: "white"
  },
  underline: {
    "&&&:before": {
      borderBottom: "none"
    },
    "&&:after": {
      borderBottom: "none"
    }
  }
});

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
        axios.request({
            method: "GET",
            url: 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search', 
            headers: {
              Authorization: `Bearer ${process.env.REACT_APP_YELP_API_KEY}`
            },
            params: params
        })
        .then((res) => {
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
        className="restauraunt-autocomplete"
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
          variant="filled"
          onChange={handleChange}
          InputProps={{
            ...params.InputProps,
            classes
          }}
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
