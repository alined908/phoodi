import React from 'react'
import {shallow} from 'enzyme';
import {UnderlyingLoginComponent} from "../../components/auth/LoginComponent"

describe("LoginComponent", () => {
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