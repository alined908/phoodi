import React from 'react';
import {TextField, CircularProgress, makeStyles} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {axiosClient} from "../../accounts/axiosClient"
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';

function sleep(delay = 0) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}

const useStyles = makeStyles({
  underline: {
    "&&&:before": {
      borderBottom: "none"
    },
    "&&:after": {
      borderBottom: "none"
    }
  }
});

const CategoryAutocomplete = (props) => {
    const [open, setOpen] = React.useState(false);
    const [loaded, setLoaded] = React.useState(false);
    const [options, setOptions] = React.useState([]);
    const loading = open && options.length === 0 && !loaded;
    const classes = useStyles()

    React.useEffect(() => {

        if (!loading) {
            return undefined;
        }

        if (!loaded){
            (async () => {
                const response = await axiosClient.get("/api/categories/", {headers: {
                        "Authorization": `JWT ${localStorage.getItem('token')}`
                    }});
                await sleep(1e3);
                setOptions(response.data.categories);
                setLoaded(true);
            })();
        }
    }, [loading]);
  return (
    <Autocomplete
      multiple
      className="category-autocomplete"
      size={props.size}
      value={props.entries}
      autoHighlight
      freeSolo
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      getOptionSelected={(option, value) => option.api_label === value.api_label}
      getOptionLabel={option => option.label}
      onChange={props.handleClick}
      options={options}
      loading={loading}
      renderOption={(option, {inputValue}) => {
        const matches = match(option.label, inputValue)
        const parts = parse(option.label, matches)
        
        return(
            <div style={{height: "2rem", display: "flex", alignItems: "center", fontFamily: "Lato", fontWeight: "600", fontSize: ".8rem"}}> 
              <img style={{width: "auto", height: "20px", marginRight: "15px"}} src={`${process.env.REACT_APP_S3_STATIC_URL}${option.api_label}.png`}></img>
              {parts.map((part, index) => (
                <span key={index} style={{ color: part.highlight ? "red" : "black" }}>
                  {part.text}
                </span>
              ))}
            </div>
      )}}
      
      renderInput={params => (
        <TextField
          {...params}
          fullWidth
          variant="filled"
          label={props.label}
          InputProps={{
            ...params.InputProps,
            classes,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        /> 
      )
    }
    />
  );
}

export default CategoryAutocomplete