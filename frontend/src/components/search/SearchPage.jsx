import React, {Component} from 'react'
import {axiosClient} from '../../accounts/axiosClient'
import styles from '../../styles/search.module.css'
import {Slider, Avatar, Checkbox, FormControlLabel, Menu, MenuItem} from '@material-ui/core'
import {SearchMap, RestaurantCard, CategoryAutocomplete, Rating, SkeletonRestaurant, Prices} from '../components'
import {ExpandMore as ExpandMoreIcon} from '@material-ui/icons'
import {Pagination} from '@material-ui/lab'
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

const defaultFilters = {
    prices: [false, false, false, false],
    categories: [],
    radius: 25,
    rating: null,
    openNow: false,
    sort: 'rating',
    start: 0
}

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

class SearchPage extends Component {
    
    constructor(props){
        super(props)
        Geocode.setApiKey(`${process.env.REACT_APP_GOOGLE_API_KEY}`);
        const params = parseURL(props.location.search)
        this.state = {
            input: params.q ? params.q : "",
            latitude: null,
            longitude: null,
            location: "",
            totalCount: null,
            results: [],
            preferences: [],
            clickedPreferences: [],
            filters: {
                prices: params.prices ? convertPrices(params.prices): [false, false, false, false],
                categories: params.categories ? params.categories.split(',') : [],
                radius: params.radius ? params.radius : 5,
                rating: params.rating ? params.rating : null,
                open_now: params.open_now ? params.open_now : false,
                sort: params.sort ? params.sort : "rating",
                start: params.start ? parseInt(params.start) : 0
            },
            loading: true,
            hoveredIndex: null,
            anchorEl: null,
            isMobile: window.matchMedia("(max-width: 768px)").matches,
            mobileTabIndex: 0
        }
    }

    async componentDidMount(){
        
        const handler = (e) => this.setState({ isMobile: e.matches });
        window.matchMedia("(max-width: 768px)").addListener(handler);
        
        let params = parseURL(this.props.location.search)

        const response = await axiosClient.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${params.location}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`)
        const result = response.data.results[0]
   
        this.setState(
            {
                location: result.formatted_address,
                latitude: result.geometry.location.lat,
                longitude: result.geometry.location.lng
            }, 
            () => this.callSearch(params)
        )

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

        if (prevProps.location !== this.props.location){
            const pastParams = parseURL(prevProps.location.search)
            const newParams = parseURL(this.props.location.search)
            if (pastParams.location !== newParams.location){
                const response = await axiosClient.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${newParams.location}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`)
                const result = response.data.results[0]
                this.setState(
                    {
                        location: result.formatted_address,
                        latitude: result.geometry.location.lat,
                        longitude: result.geometry.location.lng
                    }, 
                    () => this.callSearch(newParams)
                )
            } else {
                await this.callSearch(newParams)
            }
        }
    }

    callSearch = async (params) => {
        this.setState({loading: true})
       
        const response = await axiosClient.request({
            method: 'get',
            url: '/search/restaurants/',
            params: {...params, latitude: this.state.latitude, longitude: this.state.longitude}
        })

        this.setState({
            totalCount: response.data.count,
            results: response.data.hits
        })

        setTimeout(() => this.setState({loading: false}), 300)
    }

    handleFilterChange = async () => {
        const urlParams = parseURL(this.props.location.search)
        const params = {
            q: urlParams.q,
            location: urlParams.location,
            ...(this.state.filters.rating && {rating: this.state.filters.rating}),
            ...(this.state.filters.radius !== 25 && {radius: this.state.filters.radius}),
            ...(this.state.filters.open_now && {open_now: true}),
            ...(this.state.filters.prices.includes(true) && {prices: formatPrices(this.state.filters.prices)}),
            ...(this.state.filters.categories.length > 0 && {categories: formatCategories(this.state.filters.categories)}),
            ...(this.state.filters.start !== 0 && {start: this.state.filters.start}),
            sort: this.state.filters.sort
        }

        const urlify = new URLSearchParams(params).toString()
        this.props.history.push(`/search?${urlify}`)
    }

    handleSort = (sort) => {
        this.setState({filters: {...this.state.filters, sort}}, () => this.handleFilterChange())
    }

    handlePagination = (e, page) => {
        this.setState({filters: {...this.state.filters, start: 10 * (page - 1)}}, () => this.handleFilterChange())
    }

    handleClearFilters = () => {
        let newFilters = {q: this.state.input, latitude: this.state.latitude, longitude: this.state.longitude}
        this.setState({filters: {...defaultFilters}, ...newFilters}, () => this.handleFilterChange())
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

    handleOpenNowClick = (e) => {
        this.setState({filters: {...this.state.filters, open_now: e.target.checked}}, () => this.handleFilterChange())
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

    handleHover = (index) => {
        this.setState({hoveredIndex: index})
    }

    handleMobileTabChange = (e, newValue) => {
        this.setState({mobileTabIndex: newValue})
    }

    countFilters = (params) => {
        
        let count = 0;
        for(let key in params){
            if (key === 'q' || key === 'location' || key ==='sort' || key === 'start'){
                continue;
            }
            count += 1
        }

        return count;
    }

    render () {
        const coordinates = {latitude: this.state.latitude, longitude: this.state.longitude}
        const params = parseURL(this.props.location.search)
        const authenticated = this.props.user.authenticated
        const searchName = this.props.currentSearch ? this.props.currentSearch : (params.q ? params.q : "Food")
        const locationName = this.props.currentSearchLocation ? this.props.currentSearchLocation : "Me"
        const numFilters = this.countFilters(params)
    
        return (
            <div className={styles.searchPage}>
                <div className={styles.searchConfig}>
                    <div className={styles.filterTracker}>
                        {`${numFilters === 0 ? "No" : numFilters} Filters`}
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
                                {generatePriceLabel(this.state.filters.prices)}
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
                        <div className={styles.clearFilters} onClick={this.handleClearFilters}>
                            {this.countFilters(params) > 0 && 
                                "Clear Filters"
                            }
                        </div>
                    </div>
                    <div className={styles.filter}>
                        <div className={styles.filterTitle}>
                            Hours
                        </div>
                        <div className={styles.filterSetting}>
                            <FormControlLabel 
                                className={styles.filterCustoms}
                                control={
                                    <Checkbox 
                                        size="small"
                                        checked={this.state.filters.open_now}
                                        onChange={this.handleOpenNowClick}
                                    />
                                } 
                                label="Open Now" 
                            />
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
                            Best {searchName} Near {this.state.location}
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
                        {this.state.loading ?
                            [...Array(10).keys()].map((num) => 
                                <SkeletonRestaurant/>
                            )
                            :
                            this.state.results.map((result, index) => 
                                <RestaurantCard 
                                    onHover={this.handleHover}
                                    data={result._source} 
                                    index={index + this.state.filters.start}
                                /> 
                            )
                        }
                        <div className={styles.resultsPagination}>
                            <Pagination 
                                page={this.state.filters.start/10 + 1}
                                onChange={this.handlePagination}
                                count={Math.ceil(this.state.totalCount/10)}
                                shape="rounded"
                            />
                            <div className={styles.resultsCount}>
                                {this.state.filters.start + 1} - {Math.min(this.state.filters.start + 11, this.state.totalCount)} of {this.state.totalCount} entries
                            </div>
                        </div>
                        

                    </div>
                </div>
                <div className={styles.searchMap}>
                    {coordinates.latitude !== null && 
                        <SearchMap 
                            indexOffset={this.state.filters.start}
                            markers={this.state.results}
                            zoom={11}
                            location={coordinates}
                            radius={this.state.filters.radius}
                            hoveredIndex={this.state.hoveredIndex}
                        />
                    }
                    
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        currentSearch: state.search.lastSearched,
        currentSearchLocation: state.search.lastSearchedLocation
    }
}

const mapDispatchToProps = {
    getPreferences
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchPage)