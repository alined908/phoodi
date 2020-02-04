import React, {Component} from 'react'
import {getFriends, addFriend, deleteFriend} from "../actions/friend"
import {reduxForm, Field} from 'redux-form';
import {connect} from 'react-redux'
import {Button} from '@material-ui/core';
import {compose} from 'redux'

class FriendsComponent extends Component{

    componentDidMount(){
        this.props.getFriends();
    }

    onSubmit = (formProps) => {
        this.props.addFriend(formProps)
    }

    render(){
        const {handleSubmit} = this.props;

        const addFriendForm = () => {
            return (<form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                <div>{this.props.errorMessage}</div>
                <Field name="email" component="input" label="email"/>
                <Button type="submit" variant="contained" color="primary">Add Friend</Button>
            </form>)
        }

        return (
            <div>
                {!this.props.isFriendsInitialized && <div>...Initializing Friends</div>}
                {this.props.isFriendsInitialized && this.props.friends.map((friendship) => 
                    friendship.user.email + ", "
                )}
                {this.props.isFriendsInitialized && addFriendForm()}
            </div>
        )
    }
}

function mapStateToProps(state){
    return {
        friends: state.user.friends,
        isFriendsInitialized: state.user.isFriendsInitialized,
        errorMessage: state.user.errorMessage
    }
}

const mapDispatchToProps = {
    getFriends,
    addFriend,
    deleteFriend
}

export default compose(connect(mapStateToProps, mapDispatchToProps), reduxForm({form: 'friend'}))(FriendsComponent)