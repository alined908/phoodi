// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import appReducer from './reducers/index';
    
Enzyme.configure({ adapter: new Adapter() });

export default function setupStore(initialState) {
    return createStore(appReducer, {...initialState}, applyMiddleware(thunk));
}