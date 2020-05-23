import React, {Component} from 'react'
import {
    TextField,
    CircularProgress,
    Avatar,
    ListItemAvatar,
    ListItemText,
  } from "@material-ui/core";
import {Link} from 'react-router-dom'
import {connect} from 'react-redux'
import {axiosClient} from '../../accounts/axiosClient'
import Autocomplete from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import throttle from "lodash/throttle";
import debounce from "lodash/debounce";

class SearchBar extends Component {

    constructor(props){
        super(props)
        this.state = {
            input: "",
            isLoaded: false,
            isOpen: false,
            isLoading: false,
            results: []
        }
        this.searchDebounced = debounce(this.callSearch, 500);
        this.searchThrottled = throttle(this.callSearch, 500);
        this.cachedResults = {};
    }

    componentDidMount() {
        this.callSearch()
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
                latitude: this.props.user.settings.latitude,
                longitude: this.props.user.settings.longitude,
                radius: this.props.user.settings.radius,
            },
        })

        console.log(response.data)
        const results = response.data
        this.cachedResults[this.state.input] = results
        this.setState({results})
    }

    handleOpen = (isOpen) => {
        this.setState({isOpen})
    }

    handleSearch = (e) => {
        this.setState({input: e.target.value}, () => {
            if (this.state.input.endsWith(" ")) {
                return;
            }
            else if (this.state.input.length < 5) {
                this.searchThrottled()
            } else{
                this.searchDebounced()
            }            
        })
    }

    handleRender = (option) => {
        let row;
        let matches;
        let parts;
        
        if (option._index === "categories"){
            matches = match(option._source.label, this.state.input);
            parts = parse(option._source.label, matches);

            row = (
                <Link to={`/categories/${option._source.api_label}`}>
                    <div className="search-entry">
                        <ListItemAvatar>
                            <Avatar
                                style={{ width: 20, height: 20}}
                                variant="square"
                                src={`${process.env.REACT_APP_S3_STATIC_URL}${option._source.api_label}.png`}
                                >
                                <img
                                    style={{ width: 20, height: 20 }}
                                    alt={"&#9787;"}
                                    src={`https://meetup-static.s3-us-west-1.amazonaws.com/static/general/panda.png`}
                                />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText>
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
                <Link to={`/restaurants/${option._source.url}`}>
                    <div className="search-entry">
                        <ListItemAvatar>
                            <Avatar style={{ width: 30, height: 30}} variant="square" src={option._source.yelp_image}>
                                <img
                                    style={{ width: 20, height: 20 }}
                                    alt={"&#9787;"}
                                    src={`https://meetup-static.s3-us-west-1.amazonaws.com/static/general/panda.png`}
                                />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                            primary={
                                <>
                                    {parts.map((part, index) => (
                                        <span
                                            key={index}
                                            style={{ color: part.highlight ? "red" : "black" }}
                                        >
                                            {part.text}
                                        </span>
                                    ))}
                                </>
                            }
                            secondary={option._source.address}
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
        return (
            <Autocomplete
                size="small"
                style={{flex: 1}}
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
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.user.user
    }
}

export default connect(mapStateToProps)(SearchBar)