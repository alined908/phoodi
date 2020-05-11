import React, {Component} from 'react'
import {Helmet} from 'react-helmet'
import styles from "../../styles/meetup.module.css"
import {Slider, Avatar, CircularProgress, Grid, BottomNavigation, BottomNavigationAction,} from '@material-ui/core'
import {CategoryAutocomplete, RestaurantCard} from '../components'
import {Settings as SettingsIcon, RestaurantMenu as RestaurantMenuIcon, Add as AddIcon} from '@material-ui/icons'
import { connect } from "react-redux";
import { getPreferences } from "../../actions";
import {axiosClient} from '../../accounts/axiosClient'

const marks = [
    { value: 5 },
    { value: 10 },
    { value: 15 },
    { value: 20 },
    { value: 25 },
  ];

class Restaurants extends Component {
    constructor(props){
        super(props)
        this.state = {
            entries: [],
            preferences: [],
            clickedPreferences: [],
            isRestaurantsFetching: false,
            restaurants: [],
            radius: props.user.settings.radius,
            isMobile: window.matchMedia("(max-width: 768px)").matches,
            mobileTabIndex: 0
        }
    }

    async componentDidMount() {
        const handler = (e) => this.setState({ isMobile: e.matches });
        window.matchMedia("(max-width: 768px)").addListener(handler);
        await Promise.all ([
            this.handleGetRestaurants(),
            this.props.getPreferences(this.props.user.id) 
        ])
    }

    componentDidUpdate() {
        if (this.props.preferences !== this.state.preferences) {
          this.setState({
            preferences: this.props.preferences,
          });
        }
    }

    formatCategories = (entries) => {
        var ids = [];
        for (var category in entries) {
          ids.push(entries[category].id);
        }
        let categoriesString = ids.join(",");
    
        return categoriesString.length > 0 ? categoriesString : null;
      };

    handleGetRestaurants = async() => {
        this.setState({isRestaurantsFetching: true})
        const response = await axiosClient.request({
            method: "GET",
            url: `/api/restaurants/`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            params: {
                categories: this.formatCategories(this.state.entries),
                latitude: this.props.user.settings.latitude,
                longitude: this.props.user.settings.longitude,
                radius: this.state.radius,
            },
        })
        this.setState({isRestaurantsFetching: false, restaurants: response.data})
    }

    /**
     * Filter public/private meetups by preferences.
     * @param {number} index - Index of clicked preference
     */
    handlePreferenceClick = (index) => {
        const category = this.state.preferences[index].category;
        const clickedPreferences = [...this.state.clickedPreferences];
        let entries;
        if (!clickedPreferences[index]) {
        entries = [...this.state.entries, category];
        } else {
        entries = this.state.entries.filter(
            (entry) => JSON.stringify(entry) !== JSON.stringify(category)
        );
        }
        clickedPreferences[index] = !clickedPreferences[index];
        this.setState({ clickedPreferences, entries }, () => this.handleGetRestaurants());
    };

    /**
     * Filter public/private meetups by category from autocomplete.
     * @param {Array} values - Array of categories.
     */
    onTagsChange = (event, values) => {
        var clickedPrefs = [...this.state.clickedPreferences];

        for (var i = 0; i < clickedPrefs.length; i++) {
            if (clickedPrefs[i]) {
                let pref = this.state.preferences[i];
                let category = pref.category;
                console.log(category);
                console.log(values);
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

        this.setState({ entries: values, clickedPreferences: clickedPrefs }, () => this.handleGetRestaurants());
    };

    handleMobileTabChange = (e, newValue) => {
        this.setState({mobileTabIndex: newValue})
    }

    render (){ 
        return (
            <div className={`innerWrap  ${this.state.isMobile ? "innerWrap-mobile": ""}`}>
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>Restaurants</title>
                    <meta name="description" content="Restaurants" />
                </Helmet>
                <div className={`innerLeft ${this.state.isMobile ? "innerLeft-mobile": ""} ${this.state.mobileTabIndex === 0 ? "innerLeft-show" : ""}`} >
                    <div className="innerLeftHeader">
                        Restaurants
                    </div>
                    <div className="innerLeftHeaderBlock">
                        <div className="hr">Settings</div>
                        <div className="innerLeftHeaderBlockAction">
                            <div className="blockActionHeader">
                                Radius 
                                
                            </div>
                            <div className="blockActionContent">
                                <Slider
                                    valueLabelDisplay="off"
                                    step={5}
                                    marks={marks}
                                    value={this.state.radius}
                                    min={5}
                                    max={25}
                                    onChange={(e, val) => this.setState({radius: val})}
                                    onChangeCommitted={(e,val) => this.handleGetRestaurants()}
                                />
                                <span className="blockActionChip" style={{marginLeft: 10}}>
                                    {`${this.state.radius} miles`}
                                </span>
                            </div>
                        </div>
                        <div className="innerLeftHeaderBlockAction">
                            <div className="blockActionHeader">
                                Categories
                            </div>
                            <div className="blockActionContent">
                                <div className={`${styles.meetupsSearchBar} elevate-0`}>
                                    <CategoryAutocomplete
                                        fullWidth={true}
                                        size="small"
                                        entries={this.state.entries}
                                        handleClick={this.onTagsChange}
                                        label="Search Categories..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="innerLeftHeaderBlock">
                        <div className="hr">Preferences</div>
                        <div className={styles.preferences}>
                            {this.state.preferences.map((pref, index) => (
                                <div
                                    key={pref.id}
                                    onClick={() => this.handlePreferenceClick(index)}
                                    className={`${styles.presetCategory} ${
                                        this.state.clickedPreferences[index] ? styles.active: ""
                                    }  elevate-0`}
                                >
                                    <Avatar
                                        variant="square"
                                        src={`${process.env.REACT_APP_S3_STATIC_URL}${pref.category.api_label}.png`}
                                    />
                                    <span>{pref.category.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className={`innerRight ${this.state.isMobile ? "innerRight-mobile": ""} ${this.state.mobileTabIndex === 0 ? "" : "innerRight-show"}`}>
                    <div className="innerRightBlock">
                        <div className="innerRightBlockHeader">
                            <div className="hr">Restaurants</div>
                            {this.state.isRestaurantsFetching && 
                                <div className="loading">
                                    <CircularProgress size={30}/>
                                </div>
                                }
                            {!this.state.isRestaurantsFetching && 
                                <Grid container justify="space-evenly" spacing={1}>
                                    {this.state.restaurants.map((rst) => (
                                        <RestaurantCard data={rst}/>
                                    ))}
                                </Grid>
                            }
                        </div>
                    </div>
                </div>
                {this.state.isMobile && 
                    <div className="innerWrap-mobileControl">
                        <BottomNavigation value={this.state.mobileTabIndex} onChange={this.handleMobileTabChange} showLabels>
                            <BottomNavigationAction label="Settings" icon={<SettingsIcon/>}/>
                            <BottomNavigationAction label="Restaurants" icon={<RestaurantMenuIcon/>}/>
                        </BottomNavigation>
                    </div>
                }
            </div>
        ) 
    }
}

function mapStateToProps(state) {
    return {
      user: state.user.user,
      preferences: state.user.preferences
    };
  }
  
const mapDispatchToProps = {
    getPreferences
};

export default connect(mapStateToProps, mapDispatchToProps)(Restaurants)