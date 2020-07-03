// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";
import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import appReducer from "./reducers/index";

Enzyme.configure({ adapter: new Adapter() });

export default function setupStore(initialState) {
  return createStore(appReducer, { ...initialState }, applyMiddleware(thunk));
}

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

Object.fromEntries = Object.fromEntries || function fromEntries(iterable) {
  var entries = ('entries' in iterable ? iterable.entries() : iterable);
  var object = {};
  var entry;
  while ((entry = entries.next()) && !entry.done) {
    var pair = entry.value;
    Object.defineProperty(object, pair[0], {
      configurable: true,
      enumerable: true,
      writable: true,
      value: pair[1]
    });
  }
  return object;
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});