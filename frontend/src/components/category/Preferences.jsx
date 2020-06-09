import React, { Component } from "react";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import { reorderPreferences } from "../../actions";
import { connect } from "react-redux";
import { Preference } from "../components";
import PropTypes from "prop-types";
import { preferencePropType, userPropType } from "../../constants/prop-types";

const SortablePreference = SortableElement(
  ({ pref, sortIndex, locked, isUser, user }) => {
    return (
      <Preference
        pref={pref}
        sortIndex={sortIndex}
        locked={locked}
        isUser={isUser}
        user={user}
      />
    );
  }
);

const SortablePreferenceList = SortableContainer(
  ({ preferences, isUser, locked, user }) => {
    return (
      <div>
        {preferences.map((pref, index) => (
          <SortablePreference
            key={`pref-${pref.id}`}
            index={index}
            sortIndex={index}
            isUser={isUser}
            locked={locked}
            pref={pref}
            user={user}
          />
        ))}
      </div>
    );
  }
);

class Preferences extends Component {
  onSortEnd = ({ oldIndex, newIndex }) => {
    this.props.reorderPreferences(
      { oldRanking: oldIndex + 1, newRanking: newIndex + 1 },
      this.props.user.id
    );
  };

  render() {
    let props = {
      isUser: this.props.isUser,
      locked: this.props.locked,
      preferences: this.props.preferences,
      user: this.props.user,
    };
    return (
      <div>
        {this.props.isUser && !this.props.locked ? (
          <SortablePreferenceList {...props} onSortEnd={this.onSortEnd} />
        ) : (
          <>
            {this.props.preferences.map((pref, index) => {
              return (
                <Preference
                  key={pref.id}
                  pref={pref}
                  isUser={this.props.isUser}
                  locked={this.props.locked}
                  sortIndex={index}
                  user={this.props.user}
                />
              );
            })}
          </>
        )}
      </div>
    );
  }
}

Preferences.propTypes = {
  preferences: PropTypes.arrayOf(preferencePropType),
  user: userPropType,
  reorderPreferences: PropTypes.func.isRequired,
  locked: PropTypes.bool.isRequired,
  isUser: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    preferences: state.user.preferences,
    user: state.user.user,
  };
}

const mapDispatchToProps = {
  reorderPreferences,
};

export default connect(mapStateToProps, mapDispatchToProps)(Preferences);
