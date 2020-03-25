import React, {Component} from 'react';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import {reorderPreferences} from "../../actions/index"
import {connect} from 'react-redux'
import {Preference} from "../components"

const SortablePreference = SortableElement(({pref, sortIndex, locked, isUser}) => {

    return (
        <Preference pref={pref} sortIndex={sortIndex} locked={locked} isUser={isUser}/>
    )
})

const SortablePreferenceList = SortableContainer(({preferences, isUser, locked}) => {
 
    return (
        <div>
            {preferences.map((pref, index) => (
                <SortablePreference key={`pref-${pref.id}`} index={index} sortIndex={index} isUser={isUser} locked={locked} pref={pref}/>
            ))}
        </div>
    )
})

class Preferences extends Component {
    onSortEnd = ({oldIndex, newIndex}) => {
        this.props.reorderPreferences({oldRanking: oldIndex + 1, newRanking: newIndex + 1}, this.props.user)
    }

    render () {
        let props = {isUser: this.props.isUser, locked: this.props.locked, preferences: this.props.preferences}
        return (
            <div className="column-middle">
                {(this.props.isUser && !this.props.locked) ?
                    <SortablePreferenceList {...props} onSortEnd={this.onSortEnd}/> : 
                    <>
                        {this.props.preferences.map((pref, index) => {
                            return <Preference pref={pref} isUser={this.props.isUser} locked={this.props.locked} sortIndex={index}></Preference>
                        })}
                    </>
                }
            </div> 
        )}
}
function mapStateToProps(state) {
    return {
        preferences: state.user.preferences
    }
}

const mapDispatchToProps = {
    reorderPreferences
}

export default connect(mapStateToProps, mapDispatchToProps)(Preferences)