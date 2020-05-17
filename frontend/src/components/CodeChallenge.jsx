import React, {Component} from 'react'
import {axiosClient} from '../accounts/axiosClient'
import styles from "../styles/challenge.module.css"
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'
import {CircularProgress} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close';

const copy = (filled, destination, numCategories) => {
    const col = Number(destination.droppableId.split("-")[1]) % numCategories
    return Object.assign([], filled, {[col]: true})
}

const move = (filled, source, destination, numCategories) => {
    const oldCol = Number(source.droppableId.split("-")[1]) % numCategories
    const newCol = Number(destination.droppableId.split("-")[1]) % numCategories
    return Object.assign([], filled, {[oldCol]: false, [newCol]: true})
}   

const getStyle = (style, snapshot) => {
    if (!snapshot.isDragging) return {};
    if (!snapshot.isDropAnimating) {
      return style;
    }
    return {
      ...style,
      transitionDuration: `0.001s`,
    };
  }
  
class Card extends Component {
    constructor(props){
        super(props);
        this.state = {
            isHovered: false
        }
    }

    render () {
        const restaurant = this.props.restaurant
        return (
            <div className={`${styles.rstCard} ${this.state.isHovered ? styles.closeHovered : ""}`}>
                {!this.props.isMenu && 
                    <CloseIcon
                        size="small" 
                        color="secondary"
                        className={styles.closeIcon}
                        onClick={this.props.handleDelete} 
                        onMouseEnter={() => this.setState({isHovered: true})} 
                        onMouseLeave={() => this.setState({isHovered: false})}
                    />
                }
                <div className={styles.rstCardTop}>
                    <img className={styles.rstImg} src={restaurant.yelp_image} />
                </div>
                <div className={styles.rstCardBottom}>
                    <span>{restaurant.name}</span>
                    <div className={styles.rstCardCategories}>
                        {this.props.isMenu && this.props.categories.map((category, index) => 
                            this.props.filled[index] && <img
                                key={category.id} 
                                className={styles.categoryPicture} 
                                src={`${process.env.REACT_APP_S3_STATIC_URL}${category.api_label}.png`}
                            />
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

class Restaurant extends Component {

    render () {
        const restaurant = this.props.restaurant

        return (
            <Draggable draggableId={this.props.isMenu ? `restaurant-${restaurant.id}`: `category-${this.props.index}`} index={this.props.index}>
                {(provided, snapshot) => (
                    <React.Fragment>
                        <div 
                            ref={provided.innerRef} 
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={styles.restaurant}
                            style={getStyle(provided.draggableProps.style, snapshot)}
                        >   
                            <Card 
                                restaurant={restaurant} 
                                isMenu={this.props.isMenu}
                                handleDelete={this.props.handleDelete}
                                filled={this.props.filled}
                                categories={this.props.categories}
                            />
                        </div>
                        {snapshot.isDragging && this.props.isMenu && (
                            <div className={styles.restaurant}>
                            
                            </div>
                        )}
                    </React.Fragment>
                )}
                
            </Draggable>
        )
    }
}

class RestaurantRow extends Component {
    
    constructor(props){
        super(props);
        this.state = {
            filled: new Array(props.categories.length).fill(false)
        }
    }

    handleDelete = (index) => {
        const newFilled = Object.assign([], this.state.filled, {[index]: false})
        this.setState({filled: newFilled})
    }

    onDragEnd = result => {
        const {source, destination} = result;

        if (!destination){
            return;
        }  

        const numCategories = this.props.categories.length;
        let filled;

        if (source.droppableId.includes("restaurant")) {
            filled = copy(this.state.filled, destination, numCategories)
        } else if (source.droppableId.includes("category")){
            filled = move(this.state.filled, source, destination, numCategories)
        }
        
        this.setState({filled})
    }

    render () {
        const restaurant = this.props.restaurant
        const categories = this.props.categories
        const offset = restaurant.id * categories.length

        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                <div className={styles.restaurantRow}>
                    <Droppable droppableId={`restaurant-${restaurant.id}`} isDropDisabled={true}>
                        {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className={styles.restaurantWrapper}>
                                <Restaurant 
                                    isMenu={true}
                                    filled={this.state.filled}
                                    restaurant={restaurant}
                                    categories={categories}
                                    index={this.props.rstIndex}
                                />
                                <span style={{display: "none"}}>
                                    {provided.placeholder}
                                </span>
                            </div>
                        )}
                    </Droppable>
                    <div className={styles.columns}>
                        {categories.map((category, index) => 
                            <Droppable key={category.id} droppableId={`category-${offset + index}`}>
                                {(provided, snapshot) => (
                                    <div ref={provided.innerRef} className={styles.block}>
                                        {this.state.filled[index] ?  
                                            <Restaurant 
                                                isMenu={false}
                                                restaurant={restaurant}
                                                handleDelete={() => this.handleDelete(index)}
                                                index={offset + index} />
                                            :   
                                            <div className={styles.category}/>
                                        }
                                        <span style={{display: "none"}}>
                                            {provided.placeholder}
                                        </span>
                                    </div>  
                                )}
                            </Droppable>
                        )}
                    </div>
                </div>
            </DragDropContext>
        )
    }
}

class CodeChallenge extends Component {

    constructor(){
        super();
        this.state = {
            restaurants: [],
            categories: [],
            isFetching: true,
            isInitialized: false
        }
    }

    async componentDidMount() {

        const [restaurantResponse, categoryResponse] = await Promise.all([
            axiosClient.get(`/api/restaurants/challenge/`),
            axiosClient.get(`/api/categories/challenge/`)
        ])
        this.setState({
            restaurants: restaurantResponse.data, 
            categories: categoryResponse.data,
            isFetching: false,
            isInitialized: true
        })
    }

    render () {
        return (
            <>
                {this.state.isInitialized ?
                    <div className={`${styles.outerWrapper}`}>
                        <div className={styles.topWrapper}>
                            <div className={styles.restaurantsWrapper}>
                                <div className={styles.header}>
                                    Restaurants
                                </div>
                                <div className={styles.restaurantIndent}/>
                            </div>
                            <div className={styles.categoriesWrapper}>
                                <div className={styles.header}>
                                    Categories
                                </div>
                                <div className={styles.categories}>
                                    {this.state.categories.map((category, index) => 
                                        <div key={index} className={styles.categoryHeaderWrapper}>
                                            <div className={styles.categoryHeader}>
                                                <img 
                                                    className={styles.categoryPicture} 
                                                    src={`${process.env.REACT_APP_S3_STATIC_URL}${category.api_label}.png`}
                                                />
                                                {category.label}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.bottomWrapper}>
                            <div className={styles.restaurants}>
                                {this.state.restaurants.map((restaurant, index) =>
                                    <RestaurantRow 
                                        key={restaurant.id}
                                        rstIndex={index}
                                        restaurant={restaurant} 
                                        categories={this.state.categories}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    :
                    <div className="loading">
                        <CircularProgress size={30}/>
                    </div>
                    
                }       
            </>
        )
    }
}

export default CodeChallenge