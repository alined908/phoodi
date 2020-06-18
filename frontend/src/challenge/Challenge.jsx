import React, {Component} from 'react'
import {axiosClient} from '../accounts/axiosClient'
import styles from "../styles/challenge.module.css"
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd'
import {CircularProgress, Button, IconButton} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close';
import {connect} from 'react-redux'
import {isEqual} from 'lodash'
import {addGlobalMessage} from '../actions'
import {Undo as UndoIcon, Redo as RedoIcon} from '@material-ui/icons'
import {getRestaurants, getCategories, constructMatrix, reconstructMatrix, undoMatrix, redoMatrix} from '../actions/challenge.js'

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
                                src={`${process.env.REACT_APP_S3_STATIC_URL}/static/category/${category.api_label}.png`}
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
                            <Card 
                                restaurant={restaurant} 
                                isMenu={this.props.isMenu}
                                handleDelete={this.props.handleDelete}
                                filled={this.props.filled}
                                categories={this.props.categories}
                            />
                        )}
                    </React.Fragment>
                )}

            </Draggable>
        )
    }
}


const copy = (filled, source, destination, numCategories) => {

    const restaurantID = Number(source.droppableId.split("-")[1])
    const column = Number(destination.droppableId.split("-")[1]) % numCategories

    let oldRow = [...filled[restaurantID]]
    oldRow[column] = true

    return {...filled, [restaurantID]: [...oldRow]}
}

const move = (filled, source, destination, numCategories) => {
    const sourceCategory = Number(source.droppableId.split("-")[1])
    const restaurantID = Math.floor(sourceCategory / numCategories)
    const oldColumn = sourceCategory % numCategories
    const newColumn = Number(destination.droppableId.split("-")[1]) % numCategories

    let oldRow = [...filled[restaurantID]]
    oldRow[oldColumn] = false
    oldRow[newColumn] = true

    return {...filled, [restaurantID]: [...oldRow]}
}   

class RestaurantGrid extends Component {

    handleDelete = (restaurant, column) => {
        let oldRow = [...this.props.matrix[restaurant]]
        oldRow[column] = false
        this.props.reconstructMatrix({ ...this.props.matrix, [restaurant]: [...oldRow]})
        console.log({ ...this.props.matrix, [restaurant]: [...oldRow]})
    }

    onDragEnd = result => {
        const {source, destination} = result;
        if (!destination){
            return;
        }  

        const numCategories = this.props.categories.length;
        var filled;

        if (source.droppableId.includes("restaurant")) {
            filled = copy(this.props.matrix, source, destination, numCategories)
        } else if (source.droppableId.includes("category")){
            filled = move(this.props.matrix, source, destination, numCategories)
        }

        if (!isEqual(this.props.matrix, filled)) {
            this.props.reconstructMatrix(filled)
        }
        
    }

    render () {
        const restaurants = this.props.restaurants
        const categories = this.props.categories

        return (
            <DragDropContext onDragEnd={this.onDragEnd}>
                {restaurants.map((restaurant, index) => 
                    <div className={styles.restaurantRow} key={restaurant.id}>
                        <Droppable droppableId={`restaurant-${restaurant.id}`} isDropDisabled={true}>
                            {(provided, snapshot) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className={styles.restaurantWrapper}>
                                    <Restaurant 
                                        isMenu={true}
                                        filled={this.props.matrix[restaurant.id]}
                                        restaurant={restaurant}
                                        categories={categories}
                                        index={index}
                                    />
                                    <span style={{display: "none"}}>
                                        {provided.placeholder}
                                    </span>
                                </div>
                            )}
                        </Droppable>
                        <div className={styles.columns}>
                            {categories.map((category, index) => 
                                <Droppable key={category.id} droppableId={`category-${restaurant.id * categories.length + index}`}>
                                    {(provided, snapshot) => (
                                        <div ref={provided.innerRef} className={styles.block}>
                                            {this.props.matrix[restaurant.id][index] ?  
                                                <Restaurant 
                                                    isMenu={false}
                                                    restaurant={restaurant}
                                                    handleDelete={() => this.handleDelete(restaurant.id, index)}
                                                    index={restaurant.id * categories.length + index} />
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
                )}
            </DragDropContext>
        )
    }
}

class Challenge extends Component {


    async componentDidMount() {
        await Promise.all([this.props.getRestaurants(), this.props.getCategories()])
        this.props.constructMatrix(this.props.restaurants, this.props.categories.length)
    }

    saveMatrix = () => {
        localStorage.setItem('matrix', JSON.stringify(this.props.matrix))
        this.props.addGlobalMessage("success", "Saved to LocalStorage.")
    }

    loadMatrix = () => {
        let matrix = localStorage.getItem('matrix')

        if (matrix === null){
            this.props.addGlobalMessage("error", "No matrix in LocalStorage")
        } else{
            this.props.reconstructMatrix(JSON.parse(matrix))
        }
        
    }

    render () {

        return (
            <>
                {!this.props.isFetching && this.props.isInitialized ?
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
                                    <div>
                                        <IconButton color="primary" onClick={this.props.undoMatrix} disabled={!this.props.canUndo}>
                                            <UndoIcon/>
                                        </IconButton>
                                        <IconButton color="primary" onClick={this.props.redoMatrix} disabled={!this.props.canRedo}>
                                            <RedoIcon/>
                                        </IconButton>
                                    </div>
                                    <div>
                                        Categories
                                    </div>
                                    <div>
                                        <Button variant='contained' color="primary" onClick={this.saveMatrix} className={styles.save}> 
                                            Save
                                        </Button>
                                        <Button variant='contained' color="primary" onClick={this.loadMatrix}> 
                                            Load
                                        </Button>
                                    </div>
                                </div>
                                <div className={styles.categories}>
                                    {this.props.categories.map((category, index) => 
                                        <div key={index} className={styles.categoryHeaderWrapper}>
                                            <div className={styles.categoryHeader}>
                                                <img 
                                                    className={styles.categoryPicture} 
                                                    src={`${process.env.REACT_APP_S3_STATIC_URL}/static/category/${category.api_label}.png`}
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
                                <RestaurantGrid 
                                    restaurants={this.props.restaurants} 
                                    categories={this.props.categories}
                                    constructMatrix={this.props.constructMatrix}
                                    reconstructMatrix={this.props.reconstructMatrix}
                                    matrix={this.props.matrix}
                                    matrixHistory={this.props.matrixHistory}
                                />
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

const mapStateToProps = state => {
    return {
        restaurants: state.challenge.restaurants,
        categories: state.challenge.categories,
        isFetching: state.challenge.isRestaurantsFetching || state.challenge.isCategoriesFetching,
        isInitialized: state.challenge.isRestaurantsInitialized && state.challenge.isCategoriesInitialized && state.challenge.isMatrixConstructed,
        matrix: state.challenge.matrix,
        page: state.challenge.page,
        matrixHistory: state.challenge.matrixHistory,
        canUndo: state.challenge.page > 0,
        canRedo: state.challenge.page < state.challenge.matrixHistory.length - 1,
    }
}

const mapDispatchToProps = {
    getRestaurants,
    getCategories,
    constructMatrix,
    reconstructMatrix,
    undoMatrix,
    redoMatrix,
    addGlobalMessage
}

export default connect(mapStateToProps, mapDispatchToProps)(Challenge) 