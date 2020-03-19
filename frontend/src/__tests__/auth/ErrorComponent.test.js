import React from 'react'
import {shallow} from 'enzyme';
import {ErrorComponent} from "../../components/components"

describe("ErrorComponent smoke test", () => {
    it ('renders without crashing', () => {
        const wrapper = shallow(<ErrorComponent/>)
        expect(wrapper).toMatchSnapshot()
    })
})