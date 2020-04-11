import React from 'react'
import {shallow, mount} from 'enzyme';
import {UnderlyingLoginComponent} from "../../components/auth/LoginComponent"
import {LoginComponent} from "../../components/components"
import { Provider } from 'react-redux';
import setupStore from "../../setupTests"
import {axiosClient} from "../../accounts/axiosClient";
import MockAdapter from 'axios-mock-adapter';
import { MemoryRouter } from 'react-router';
import {Body} from "../../components/components"
import { createBrowserHistory } from 'history';

describe("LoginComponent unit", () => {
    it ('renders without crashing given props', () => {
        const props = {
            errorMessage: "",
            signin: jest.fn(),
            handleSubmit: jest.fn()
        }
        const wrapper = shallow(<UnderlyingLoginComponent {...props}/>)
        expect(wrapper).toMatchSnapshot()
    })

    it('dispatches correct action on submit', () => {
        const props = {
            errorMessage: "",
            signin: jest.fn(),
            handleSubmit: jest.fn()
        }
        const mockData = {first_name: "Daniel", last_name: "Lee", email: "daniel@gmail.com", password: "password"}

        const wrapper = shallow(<UnderlyingLoginComponent {...props}/>)
        wrapper.instance().onSubmit(mockData);
        expect(props.signin.mock.calls.length).toBe(1);
    })
})

describe("LoginComponent integration", () => {
    let httpMock;
    let store;

    const flushAllPromises = () => new Promise(resolve => setImmediate(resolve));

    beforeEach(() => {
        httpMock = new MockAdapter(axiosClient);
        history = createBrowserHistory()
        store = setupStore();
    });

    it('should log in user if login information correct and redirect to /meetups', () => {
        httpMock.onPost('/api/token/', {email: "daniel@gmail.com", password: "password"}).reply(200, {
            status: "success",
            token: "ADWDAWDWADAWDAWDWD",
            user: {1: {id: 1, first_name: "Daniel", last_name: "Lee", email: "daniel@gmail.com"}}
        })
        
        let wrapper = mount(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/login']}>
                    <Body/>
                </MemoryRouter>
            </Provider>
        )
        wrapper.update()
        console.log(wrapper.debug())
        expect(wrapper.find('Connect(Form(LoginComponent))')).toHaveLength(1)
        
        // await flushAllPromises();
        // wrapper.update();
    })
})