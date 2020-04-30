import React from 'react'
import {shallow, mount} from 'enzyme';
import LoginPage, {UnderlyingLoginPage} from "../../components/auth/LoginPage"
import { Provider } from 'react-redux';
import setupStore from "../../setupTests"
import {axiosClient} from "../../accounts/axiosClient";
import MockAdapter from 'axios-mock-adapter';
import { MemoryRouter } from 'react-router';
import {Body} from "../../components/components"
import { createBrowserHistory } from 'history';

describe("LoginPage", () => {
    it ('renders without crashing given props', () => {
        const props = {
            errorMessage: "",
            signin: jest.fn(),
            handleSubmit: jest.fn()
        }
        const wrapper = shallow(<UnderlyingLoginPage {...props}/>)
        expect(wrapper).toMatchSnapshot()
    })

    it('dispatches correct action on submit', () => {
        const props = {
            location: {state: "something"},
            errorMessage: "",
            signin: jest.fn(),
            handleSubmit: jest.fn()
        }
        const mockData = {email: "daniel@gmail.com", password: "password"}

        const wrapper = shallow(<UnderlyingLoginPage {...props}/>)
        wrapper.instance().onSubmit(mockData);
        expect(props.signin.mock.calls.length).toBe(1);
    })

    it ('render errorMessage', () => {
        const props = {
            errorMessage: "Email or password is wrong.",
            signin: jest.fn(),
            handleSubmit: jest.fn()
        }
        const wrapper = shallow(<UnderlyingLoginPage {...props}/>)
        expect(wrapper.find('.error').length).toBe(1)
        expect(wrapper.find('.error').text()).toBe("Email or password is wrong.")
    })
})