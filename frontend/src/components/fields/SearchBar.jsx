import React, {Component} from 'react'
import {
    TextField,
    CircularProgress,
    Avatar,
    ListItemAvatar,
    ListItemText,
  } from "@material-ui/core";
import {Location} from '../components'
import {Link} from 'react-router-dom'
import {connect} from 'react-redux'
import {axiosClient} from '../../accounts/axiosClient'
import Autocomplete from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import throttle from "lodash/throttle";
import debounce from "lodash/debounce";
import Geocode from "react-geocode";
import SearchIcon from '@material-ui/icons/Search';

class SearchBar extends Component {

    constructor(props){
        super(props)
        this.state = {
            input: "",
            isLoaded: false,
            isOpen: false,
            isLoading: false,
            results: [],
            cachedSearches: [],
            location: "",
            longitude: null,
            latitude: null
        }
        this.searchDebounced = debounce(this.callSearch, 500);
        this.searchThrottled = throttle(this.callSearch, 500);
        this.cachedResults = {};
    }

    componentDidMount() {
        Geocode.setApiKey(`${process.env.REACT_APP_GOOGLE_API_KEY}`);
        const cachedSearches = localStorage.getItem("searchSuggestionHistory")

        if (cachedSearches !== null) {
            const results = JSON.parse(cachedSearches).suggestions
            this.setState({results, cachedSearches: results})
        }
    }

    callSearch = async () => {
        const cachedResult = this.cachedResults[this.state.input]
        console.log(this.cachedResults)
    
        if (cachedResult) {
            this.setState({results: cachedResult});
            return; 
        }

        const response = await axiosClient.request({
            method: "GET",
            url: `/search/`,
            params: {
                ...this.state.input && {q: this.state.input},
                latitude: this.props.user ? this.props.user.settings.latitude : null,
                longitude: this.props.user ? this.props.user.settings.longitude : null,
                radius: this.props.user ? this.props.user.settings.radius: null,
            },
        })

        console.log(response.data)
        const results = response.data
        this.cachedResults[this.state.input] = results
        this.setState({results})
    }

    persistSearchToStorage = (option) => {
        const cached = localStorage.getItem("searchSuggestionHistory")
        let suggestions;

        if (cached === null){
            suggestions = [option]
        } else {
            let parsed = JSON.parse(cached)
            
            for (let i = 0; i < parsed.suggestions.length; i ++) {
                if (option._id === parsed.suggestions[i]._id){
                    parsed.suggestions.splice(i, 1)
                    break;
                }
            }

            suggestions = [option].concat(parsed.suggestions).slice(0, 5)
        }

        const newCached = {id: this.props.user.id, suggestions}
        localStorage.setItem('searchSuggestionHistory', JSON.stringify(newCached))
    }

    handleOpen = (isOpen) => {
        this.setState({isOpen})
    }

    handleSearch = (e) => {
        this.setState({input: e.target.value}, () => {
            if (this.state.input.length === 0) {
                this.setState({results: this.state.cachedSearches})
            }
            else if (this.state.input.endsWith(" ")) {
                return;
            }
            else if (this.state.input.length < 5) {
                this.searchThrottled()
            } else{
                this.searchDebounced()
            }            
        })
    }

    handleClick = (e, value) => {
        let location;
        if (value === null) {
          location = "";
        } else {
          location = value.description;
          Geocode.fromAddress(location).then(
            (response) => {
              const geolocation = response.results[0].geometry.location;
              console.log(geolocation)
              this.setState({
                longitude: geolocation.lng,
                latitude: geolocation.lat,
              });
            },
            (error) => {
              console.error(error);
            }
          );
        }
        this.setState({ location });
      };

    handleRender = (option) => {
        let row;
        let matches;
        let parts;
        
        if (option._index === "categories"){
            matches = match(option._source.label, this.state.input);
            parts = parse(option._source.label, matches);

            row = (
                <Link onClick={() => this.persistSearchToStorage(option)} to={`/categories/${option._source.api_label}`} style={{width: "100%"}}>
                    <div className="search-entry">
                        <ListItemAvatar>
                            <Avatar
                                style={{ width: 20, height: 20}}
                                variant="square"
                                src={`${process.env.REACT_APP_S3_STATIC_URL}/static/category/${option._source.api_label}.png`}
                                >
                                <img
                                    style={{ width: 20, height: 20 }}
                                    alt={"&#9787;"}
                                    src={`${process.env.REACT_APP_S3_STATIC_URL}/static/general/panda.png`}
                                />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                            primaryTypographyProps={
                                {style: {fontSize: ".8rem"}}
                            }
                        >
                            {parts.map((part, index) => (
                                <span
                                    key={index}
                                    style={{ color: part.highlight ? "red" : "black" }}
                                >
                                    {part.text}
                                </span>
                            ))}
                        </ListItemText>
                    </div>
                </Link>
            )
        } else {
            matches = match(option._source.name, this.state.input);
            parts = parse(option._source.name, matches);

            row = (
                <Link onClick={() => this.persistSearchToStorage(option)} to={`/restaurants/${option._source.url}`} style={{width: "100%"}}>
                    <div className="search-entry">
                        <ListItemAvatar>
                            <Avatar style={{ width: 30, height: 30}} variant="square" src={option._source.yelp_image}>
                                <img
                                    style={{ width: 20, height: 20 }}
                                    alt={"&#9787;"}
                                    src={`${process.env.REACT_APP_S3_STATIC_URL}/static/general/panda.png`}
                                />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                            primary={
                                <>
                                    <span>
                                        {parts.map((part, index) => (
                                            <span
                                                key={index}
                                                style={{ color: part.highlight ? "red" : "black" }}
                                            >
                                                {part.text}
                                            </span>
                                        ))}
                                    </span>
                                    <span>
                                        {option._source.categories.slice(0,2).map((category) => 
                                            <span className="blockActionChip searchChip" >
                                                {category.label}
                                            </span>
                                        )}
                                    </span>
                                </>
                            }
                            primaryTypographyProps={
                                {style: {display: "flex", justifyContent: "space-between"}}
                            }
                            secondary={option._source.address}
                            secondaryTypographyProps={
                                {style: {fontSize: ".7rem"}}
                            }
                        >
                        </ListItemText>
                    </div>
                </Link>
            )
        }

        return row
    }

    handleLabel = (option) => {
        let label;

        if (option._index === "categories"){
            label = option._source.label
        } else {
            label = option._source.name
        }
        return label
    }

    render () {
        
        const searchLink = `/search?q=${this.state.input}&latitude=${this.state.latitude}&longitude=${this.state.longitude}`

        return (
            <>
                <Autocomplete
                    freeSolo
                    size="small"
                    style={{flex: 1, boxShadow: "none"}}
                    getOptionLabel={(option) =>
                        this.handleLabel(option)
                    }
                    filterOptions={(x) => x}
                    loading={this.state.isLoading}
                    open={this.state.isOpen}
                    onOpen={() => this.handleOpen(true)}
                    onClose={() => this.handleOpen(false)}
                    options={this.state.results}
                    loading={this.state.isLoading}
                    renderOption={(option, { inputValue }) => 
                        this.handleRender(option)
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search restaurants, categories, ..."
                            variant="filled"
                            onChange={this.handleSearch}
                            InputProps={{
                                ...params.InputProps,
                                disableUnderline: true,
                                style: {background: "white", fontSize: ".8rem"},
                                endAdornment: (
                                <>
                                    {this.state.isLoading ? (
                                    <CircularProgress color="inherit" size={20} />
                                    ) : null}
                                    {params.InputProps.endAdornment}
                                </>
                                ),
                            }}
                        />
                    )}
                />
                <Location
                    required={false}
                    label="Location"
                    handleClick={this.handleClick}
                    textValue={this.state.location}
                />
                <Link to={searchLink}>
                    <div className="search-button">
                        <SearchIcon />
                    </div>
                </Link>
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.user.user
    }
}

export default connect(mapStateToProps)(SearchBar)