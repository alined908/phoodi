import React from "react";
import { shallow, mount } from "enzyme";
import { RestaurantGrid, Restaurant, Card, Challenge } from "../../components/challenge/Challenge"

//Mocks
const matrix = {
    1: [false, false, false, false],
    2: [false, false, false, false],
    3: [false, false, false, false],
    4: [false, false, false, false],
}

const categories = [
    {id: 1, api_label: "dessert", label: "Dessert"},
    {id: 2, api_label: "pizza", label: "Pizza"},
    {id: 3, api_label: "chinese", label: "Chinese"},
    {id: 4, api_label: "korean", label: "Korean"}
]

const restaurants = [
    {id: 1, name: "Pizza place"},
    {id: 2, name: "Dessert place"},
    {id: 3, name: "Chinese place"},
    {id: 4, name: "Korean place"}
]

//Components
const cardProps = {
    filled: matrix[1],
    categories,
    restaurant: restaurants[0],
    handleDelete: jest.fn()
}

describe("Card", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders without crashing given props", () => {
        const wrapper = shallow(<Card {...cardProps} />);
        expect(wrapper).toMatchSnapshot();
    });

    it('does not render closeIcon if part of menu', () => {
        const updatedProps = {...cardProps, isMenu: true}
        const wrapper = shallow(<Card {...updatedProps} />);
        const closeIcon = wrapper.find('.closeIcon')
        expect(closeIcon).toHaveLength(0)
    })

    it('renders closeIcon if not part of menu and handles onClick', () => {
        const updatedProps = {...cardProps, isMenu: false}
        const wrapper = shallow(<Card {...updatedProps} />);
        const closeIcon = wrapper.find('.closeIcon')
        expect(closeIcon).toHaveLength(1)
        closeIcon.simulate('click')
        expect(updatedProps.handleDelete.mock.calls.length).toBe(1);
    })

    it ('renders categories if part of menu', () => {
        let newMatrix = [...matrix[1]]
        newMatrix[0] = true
        const updatedProps = {...cardProps, isMenu: true, filled: newMatrix}
        const wrapper = shallow(<Card {...updatedProps} />);
        const categories = wrapper.find('.categoryPicture')
        expect(categories).toHaveLength(1)
    })
})

const restaurantProps = {
    restaurant: restaurants[0],
    isMenu: false,
    filled: matrix[1],
    categories,
    handleDelete: jest.fn(),
    index: 0,
}

describe("Restaurant", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders without crashing given props", () => {
        const wrapper = shallow(<Restaurant {...restaurantProps} />);
        expect(wrapper).toMatchSnapshot();
    });

    it('displays draggableId as category-X if not part of menu', () => {
        const wrapper = shallow(<Restaurant {...restaurantProps} />);
        const draggable = wrapper.find('PublicDraggable')
        expect(draggable).toHaveLength(1)
        expect(draggable.prop('draggableId')).toEqual('category-0')
    })

    it('displays draggableId as restaurant-X if part of menu', () => {
        const updatedProps = {...restaurantProps, isMenu: true}
        const wrapper = shallow(<Restaurant {...updatedProps} />);
        const draggable = wrapper.find('PublicDraggable')
        expect(draggable).toHaveLength(1)
        expect(draggable.prop('draggableId')).toEqual('restaurant-1')
    })
})

const gridProps = {
    matrix,
    categories,
    restaurants,
    reconstructMatrix: jest.fn()
}

describe("RestaurantGrid", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders without crashing given props", () => {
        const wrapper = shallow(<RestaurantGrid {...gridProps} />);
        expect(wrapper).toMatchSnapshot();
    });

    it('constructs numCategories + 1 * numRestaurants droppable zones', () => {
        const wrapper = shallow(<RestaurantGrid {...gridProps} />);
        const droppables = wrapper.find('Connect(Droppable)')
        expect(droppables).toHaveLength((gridProps.categories.length + 1) * gridProps.restaurants.length)
    })

    it('makes call to reconstructMatrix if handleDelete called', () => {
        const wrapper = shallow(<RestaurantGrid {...gridProps} />);
        wrapper.instance().handleDelete(1, 0)
        expect(gridProps.reconstructMatrix.mock.calls.length).toBe(1)
    })

    it('reconstructs matrix given restaurant source and category destination', () => {
        const wrapper = shallow(<RestaurantGrid {...gridProps} />);
        const source = {droppableId: 'restaurant-1'}
        const destination = {droppableId: 'category-1'}
        const result = {source, destination}
        wrapper.instance().onDragEnd(result)
        const params = gridProps.reconstructMatrix.mock.calls[0][0]
        const expectedResult = {
            ...matrix,
            [1]: [false, true, false , false]
        }
        expect(gridProps.reconstructMatrix.mock.calls.length).toBe(1)
        expect(params).toEqual(expectedResult)
    })

    it('reconstructs matrix given category source and category destination', () => {
        const wrapper = shallow(<RestaurantGrid {...gridProps} />);
        const source = {droppableId: 'category-4'}
        const destination = {droppableId: 'category-5'}
        const result = {source, destination}
        wrapper.instance().onDragEnd(result)
        const params = gridProps.reconstructMatrix.mock.calls[0][0]
        const expectedResult = {
            ...matrix,
            [1]: [false, true, false , false]
        }
        expect(gridProps.reconstructMatrix.mock.calls.length).toBe(1)
        expect(params).toEqual(expectedResult)
    })
})

const challengeProps = {
    restaurants,
    categories,
    matrix,
    isFetching: false,
    isInitialized: true,
    getRestaurants: jest.fn(),
    getCategories: jest.fn(),
    addGlobalMessage: jest.fn(),
    constructMatrix: jest.fn(),
    reconstructMatrix: jest.fn(),
    undoMatrix: jest.fn(),
    redoMatrix: jest.fn()
}

describe("Challenge", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("renders without crashing given props", () => {
        const wrapper = shallow(<Challenge {...challengeProps} />);
        expect(wrapper).toMatchSnapshot();
    });

    it ('should show loading state if not initialized or fetching', () => {
        const updatedProps = {...challengeProps, isFetching: true}
        const wrapper = shallow(<Challenge {...updatedProps} />);
        const loading = wrapper.find('.loading')
        expect(loading).toHaveLength(1)
    })

    it('makes calls to getRestaurants and getCategories on component mount', () => {
        const wrapper = shallow(<Challenge {...challengeProps} />);
        expect(challengeProps.getRestaurants.mock.calls.length).toBe(1)
        expect(challengeProps.getCategories.mock.calls.length).toBe(1)
    })

    it('makes call to saveMatrix if save Button is clicked', () => {
        const wrapper = shallow(<Challenge {...challengeProps} />);
        const save = wrapper.find('.save')
        expect(save).toHaveLength(1)
        save.simulate('click')
        expect(challengeProps.addGlobalMessage.mock.calls.length).toBe(1)
    })

    it('makes call to loadMatrix if load Button is clicked', () => {
        const wrapper = shallow(<Challenge {...challengeProps} />);
        const load = wrapper.find('.load')
        expect(load).toHaveLength(1)
        load.simulate('click')
        expect(challengeProps.reconstructMatrix.mock.calls.length).toBe(1)
    })

    it ('makes call to undoMatrix if undo Button is clicked', () => {
        const wrapper = shallow(<Challenge {...challengeProps} />);
        const undo = wrapper.find('[data-testid="undo"]')
        expect(undo).toHaveLength(1)
        undo.simulate('click')
        expect(challengeProps.undoMatrix.mock.calls.length).toBe(1)
    })

    it ('makes call to redoMatrix if redo Button is clicked', () => {
        const wrapper = shallow(<Challenge {...challengeProps} />);
        console.log(wrapper.debug())
        const redo = wrapper.find('[data-testid="redo"]')
        expect(redo).toHaveLength(1)
        redo.simulate('click')
        expect(challengeProps.redoMatrix.mock.calls.length).toBe(1)
    })
})