import React, {Component} from 'react'
import {axiosClient} from '../../accounts/axiosClient'
import styles from '../../styles/search.module.css'
import {Button, ButtonGroup, Slider, Avatar, Checkbox, FormControlLabel, Menu, MenuItem} from '@material-ui/core'
import {Map, RestaurantCard, CategoryAutocomplete, Rating} from '../components'
import {ExpandMore as ExpandMoreIcon} from '@material-ui/icons'
import Geocode from "react-geocode";
import {connect} from 'react-redux'
import { getPreferences } from "../../actions";

const marks = [
    { value: 5 },
    { value: 10 },
    { value: 15 },
    { value: 20 },
    { value: 25 },
  ];

const priceLabel = ["< $10", "$11 - $30", "$31 - $60", "> $60"];

const generatePriceLabel = (prices) => {
    let labels = [];

    for (let i = 0; i < prices.length; i++) {
      if (prices[i]) {
        labels.push(priceLabel[i]);
      }
    }

    if (labels.length === 0) {
        return 'All'
    }

    return labels.join("\xa0, \xa0\xa0");
  };

const parseURL = path => {
    let params = new URLSearchParams(path)
    params = Object.fromEntries(params)
    params.latitude = parseFloat(params.latitude)
    params.longitude = parseFloat(params.longitude)
    return params
}

const formatCategories = (entries) => {
    var ids = [];
    for (var category in entries) {
      ids.push(entries[category].label);
    }

    return ids
};

const formatPrices = (prices) => {
    let priceVals = []

    for(let i = 0; i < prices.length; i++) {
        if (prices[i]){
            priceVals.push(i+1)
        }
    }

    return priceVals
}

const convertPrices = (prices) => {
    let priceBools = [false, false, false, false]

    for (let i = 0; i < prices.length; i ++){
        const index = prices[i]
        priceBools[index - 1] = true
    }

    return priceBools
}

class Prices extends Component {

    render () {
        return (
            <div className={styles.priceFilter}>
                <ButtonGroup color="primary">
                    <Button
                        variant={
                            this.props.prices[0] ? "contained" : "outlined"
                        }
                        onClick={() => this.props.onClick(0)}
                    >
                        $
                    </Button>
                    <Button
                        variant={
                            this.props.prices[1] ? "contained" : "outlined"
                        }
                        onClick={() => this.props.onClick(1)}
                    >
                        $$
                    </Button>
                    <Button
                        variant={
                            this.props.prices[2] ? "contained" : "outlined"
                        }
                        onClick={() => this.props.onClick(2)}
                    >
                        $$$
                    </Button>
                    <Button
                        variant={
                            this.props.prices[3] ? "contained" : "outlined"
                        }
                        onClick={() => this.props.onClick(3)}
                    >
                        $$$$
                    </Button>
                </ButtonGroup>
            </div>
        )
    }
}

class SearchPage extends Component {
    
    constructor(props){
        super(props)
        this.params = parseURL(props.location.search)
        Geocode.setApiKey(`${process.env.REACT_APP_GOOGLE_API_KEY}`);
        this.state = {
            anchorEl: null,
            input: this.params.q ? this.params.q : "",
            latitude: this.params.latitude,
            longitude: this.params.longitude,
            location: "",
            results: [],
            preferences: [],
            clickedPreferences: [],
            filters: {
                prices: this.params.prices ? convertPrices(this.params.prices): [false, false, false, false],
                categories: this.params.categories ? this.params.categories.split(',') : [],
                radius: this.params.radius ? this.params.radius : 25,
                rating: this.params.rating ? this.params.rating : null,
                openNow: this.params.open ? this.params.open : false,
                sort: this.params.sort ? this.params.sort : "rating"
            },
            isMobile: window.matchMedia("(max-width: 768px)").matches,
            mobileTabIndex: 0
        }
    }

    async componentDidMount(){

        const handler = (e) => this.setState({ isMobile: e.matches });
        window.matchMedia("(max-width: 768px)").addListener(handler);

        await this.callSearch()
        this.coordinatesToAddress()

        if (this.props.user.authenticated) {
            this.props.getPreferences(this.props.user.user.id)
        }
    }

    async componentDidUpdate(prevProps) {
        if (this.props.user.preferences !== this.state.preferences) {
          this.setState({
            preferences: this.props.user.preferences,
          });
        }
        if (this.props.location !== prevProps.location){
            await this.callSearch()
        }   
    }

    coordinatesToAddress = () => {
        Geocode.fromLatLng(this.state.latitude, this.state.longitude).then(
            response => {
                const options = response.results[0].address_components;
                let city;
                let state;

                for (let i = 0; i < options.length; i++){
                    let option = options[i]
                    if (option.types.includes('locality')){
                        city = option.long_name
                    }
                    if (option.types.includes('administrative_area_level_1')){
                        state = option.short_name
                    }
                }

                this.setState({
                    location: `${city}, ${state}`
                })
            },
            error => {
                console.error(error);
            }
        )
    }

    callSearch = async () => {
        const urlParams = new URLSearchParams(this.props.location.search)
        const params = Object.fromEntries(urlParams)
        console.log(params)
        const response = await axiosClient.request({
            method: 'get',
            url: '/search/restaurants/',
            params
        })
        console.log(response.data)

        this.setState({
            results: response.data
        })
    }

    handleFilterChange = async () => {
        const params = {
            latitude: this.state.latitude, 
            longitude: this.state.longitude, 
            q: this.state.input,
            ...(this.state.filters.rating && {rating: this.state.filters.rating}),
            ...(this.state.filters.radius !== 25 && {radius: this.state.filters.radius}),
            ...(this.state.filters.openNow && {open: true}),
            ...(this.state.filters.prices.includes(true) && {prices: formatPrices(this.state.filters.prices)}),
            ...(this.state.filters.categories.length > 0 && {categories: formatCategories(this.state.filters.categories)}),
            sort: this.state.filters.sort
        }

        const urlify = new URLSearchParams(params).toString()
        this.props.history.push(`/search?${urlify}`)
    }

    handleSort = (sort) => {
        this.setState({filters: {...this.state.filters, sort}}, () => this.handleFilterChange())
    }

    handleMenuClick = (e) => {
        this.setState({
            anchorEl: e.currentTarget
        })
    }

    handleMenuClose = (e) => {
        this.setState({
            anchorEl: null
        })
    }

    handlePriceClick = (price) => {
        let prices = [...this.state.filters.prices]
        prices[price] = !prices[price]
        this.setState({filters: {...this.state.filters, prices}}, () => this.handleFilterChange())
    }

    handleRatingClick = (e, rating) => {
        this.setState({filters: {...this.state.filters, rating: rating * 2}},() => this.handleFilterChange())
    }

    handlePreferenceClick = (index) => {
        const category = this.state.preferences[index].category;
        const clickedPreferences = [...this.state.clickedPreferences];
        let categories;
        if (!clickedPreferences[index]) {
            categories = [...this.state.filters.categories, category];
        } else {
            categories = this.state.filters.categories.filter(
                (entry) => JSON.stringify(entry) !== JSON.stringify(category)
            );
        }
        clickedPreferences[index] = !clickedPreferences[index];
        this.setState({ clickedPreferences, filters: {...this.state.filters, categories }}, () => this.handleFilterChange());
    };

    onTagsChange = (event, values) => {
        var clickedPrefs = [...this.state.clickedPreferences];

        for (var i = 0; i < clickedPrefs.length; i++) {
            if (clickedPrefs[i]) {
                let pref = this.state.preferences[i];
                let category = pref.category;
           
                if (!values.includes(category)) {
                    clickedPrefs[i] = !clickedPrefs[i];
                }
            }
        }

        for (var j = 0; j < values.length; j++) {
            let category = values[j];

            for (var z = 0; z < this.state.preferences.length; z++) {
                let preference = this.state.preferences[z];
                if (JSON.stringify(preference.category) === JSON.stringify(category) && clickedPrefs[z] !== true) {
                    clickedPrefs[z] = true;
                }
            }
        }

        this.setState({clickedPreferences: clickedPrefs,  filters: {...this.state.filters, categories: values}}, () => this.handleFilterChange());
    };

    handleMobileTabChange = (e, newValue) => {
        this.setState({mobileTabIndex: newValue})
    }

    countFilters = (params) => {
        
        let count = 0;
        for(let key in params){
            if (key === 'q' || key === 'latitude' || key==='longitude' || key ==='sort'){
                continue;
            }
            count += 1
        }

        return count;
    }

    render () {
        const location = {
            latitude: this.state.latitude,
            longitude: this.state.longitude,
        }
        const params = parseURL(this.props.location.search)
        const authenticated = this.props.user.authenticated
        
        return (
            <div className={styles.searchPage}>
                <div className={styles.searchConfig}>
                    <div className={styles.filterTracker}>
                        {`${this.countFilters(params)} Filters`}
                        {params.hasOwnProperty('radius') &&
                            <span className={styles.chip}>
                                {this.state.filters.radius} miles
                            </span>
                        }
                        {params.hasOwnProperty('rating') &&
                            <span className={styles.chip}>
                                >= {this.state.filters.rating} 
                            </span>
                        }
                        {params.hasOwnProperty('prices') &&
                            <span className={styles.chip}>
                                {this.state.filters.prices} 
                            </span>
                        }
                        {this.state.filters.categories.map((category) => 
                            <span className={styles.chip}>
                                <Avatar
                                    variant="square"
                                    src={`${process.env.REACT_APP_S3_STATIC_URL}/static/category/${category.api_label}.png`}
                                >
                                <img
                                    alt={"&#9787;"}
                                    src={`${process.env.REACT_APP_S3_STATIC_URL}/static/general/panda.png`}
                                />
                                </Avatar>
                                {category.label}
                            </span>
                        )}
                    </div>
                    <div className={styles.filter}>
                        <div className={styles.filterTitle}>
                            Hours
                        </div>
                        <div className={styles.filterSetting}>
                            <FormControlLabel control={<Checkbox name="checkedC" />} label="Open Now" />
                        </div>
                    </div>
                    <div className={styles.filter}>
                        <div className={styles.filterTitle}>
                            Rating
                            <span className={styles.chip} style={{marginLeft: 10}}>
                                {this.state.filters.rating ? this.state.filters.rating : "All"}
                            </span>
                        </div>
                        <div className={styles.filterSetting}>
                            <Rating
                                rating={this.state.filters.rating}
                                onChange={this.handleRatingClick}
                                readOnly={false}
                            />
                        </div>
                    </div>
                    <div className={styles.filter}>
                        <div className={styles.filterTitle}>
                            Price
                            <span className={styles.chip} style={{marginLeft: 10}}>
                                {generatePriceLabel(this.state.filters.prices)}
                            </span>
                        </div>
                        <div className={styles.filterSetting}>
                            <Prices 
                                onClick={this.handlePriceClick}
                                prices={this.state.filters.prices}
                            />
                        </div>
                    </div>
                    <div className={styles.filter}>
                        <div className={styles.filterTitle}>
                            Distance
                            <span className={styles.chip} style={{marginLeft: 10}}>
                                {`${this.state.filters.radius} miles`}
                            </span>
                        </div>
                        <div className={styles.filterSetting}>
                            <Slider
                                valueLabelDisplay="off"
                                step={5}
                                marks={marks}
                                value={this.state.filters.radius}
                                min={5}
                                max={25}
                                onChange={(e, val) => this.setState({filters: {...this.state.filters, radius: val}})}
                                onChangeCommitted={() => this.handleFilterChange()}
                            />
                            
                        </div>
                    </div>
                    <div className={styles.filter}>
                        <div className={styles.filterTitle}>
                            Categories
                        </div>
                        <div className={styles.filterSetting}>
                            <CategoryAutocomplete
                                entries={this.state.filters.categories}
                                fullWidth={true}
                                size="small"
                                handleClick={this.onTagsChange}
                                label="Search Categories..."
                            />
                        </div>
                    </div>
                    {authenticated &&
                        <div className={styles.filter}>
                            <div className={styles.filterTitle}>
                                Preferences
                            </div>
                            <div className={styles.filterSetting}>
                                <div className={styles.preset}>
                                    {this.state.preferences.map((pref, index) => (
                                        <div
                                            key={pref.id}
                                            onClick={() => this.handlePreferenceClick(index)}
                                            className={`${styles.presetCategory} ${
                                            this.state.clickedPreferences[index] ? styles.active: ""
                                            }`}
                                        >
                                            <Avatar
                                                variant="square"
                                                src={`${process.env.REACT_APP_S3_STATIC_URL}/static/category/${pref.category.api_label}.png`}
                                            />
                                            <span>
                                                {pref.category.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    }
                    
                </div>
                <div className={styles.resultsWrapper}>
                    <div className={styles.resultsTop}>
                        <div className={styles.resultsName}>
                            Best {this.params.q ? this.params.q : "Food"} Near {this.state.location}
                        </div>
                        <div className={styles.resultsSortWrapper}>
                            Sort:&nbsp;
                            <span onClick={this.handleMenuClick} className={styles.resultsSort}>
                                {this.state.filters.sort} <ExpandMoreIcon fontSize="inherit" color="primary"/>
                            </span>
                        </div>
                        <Menu
                            anchorEl={this.state.anchorEl}
                            open={Boolean(this.state.anchorEl)}
                            onClose={this.handleMenuClose}
                            getContentAnchorEl={null}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                              }}
                              transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                              }}
                        >
                            <MenuItem onClick={(e) => {this.handleSort("rating");this.handleMenuClose(e)}}>
                                Highest Rated
                            </MenuItem>
                            <MenuItem onClick={(e) => {this.handleSort("reviews");this.handleMenuClose(e)}}>
                                Most Reviews
                            </MenuItem>
                        </Menu>
                    </div>
                    <div className={styles.results}>
                        {this.state.results.map((result, index) => 
                            <RestaurantCard data={result} index={index}/>
                        )}
                    </div>
                </div>
                <div className={`${styles.searchMap} elevate`}>
                    <Map 
                        zoom={10}
                        location={location}
                    />
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.user
    }
}

const mapDispatchToProps = {
    getPreferences
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchPage)