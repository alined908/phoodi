import React, {Component} from 'react';
import {reduxForm, Field} from 'redux-form';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {signup, editUser} from "../../actions/index"
import {Typography, Paper, Grid, Fab, Button, TextField, Avatar} from '@material-ui/core';
import {Lock as LockIcon, Email as EmailIcon, Face as FaceIcon} from '@material-ui/icons'
import {renderTextField} from '../components'
import {Link} from "react-router-dom"
import PropTypes from "prop-types"
import {userPropType} from "../../constants/prop-types"

const validate = values => {
    const errors = {}
    if (!values.first_name){
        errors.first_name = "First Name is required."
    }

    if (!values.last_name){
        errors.last_name = "Last Name is required."
    }

    if (!values.email){
        errors.email = 'Email is required.'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = 'Email Address is not valid.'
    }


    if (!values.password || (values.password.length < 6)){
        errors.password = "Password must be more than 6 characters"
    }

    return errors
}

class RegisterComponent extends Component {

    constructor(props){
        super(props)
        this.state = {
            image: null
        }
    }

    onSubmit = formProps => {
        let data = new FormData()
        for(var key in formProps) {
            data.append(key.toString(), formProps[key])
        }
        if (this.state.image !== null) {
            data.append('avatar', this.state.image, this.state.image.name)
        }   
        if (this.props.type === "create") {
            console.log("this one")
            this.props.signup(data, () => {
                this.props.history.push("/meetups")
            });
        }

        if (this.props.type === "edit") {
            this.props.editUser(data, this.props.user.id, () => {
                this.props.history.push(`/profile/${this.props.user.id}`)
            })
        }
       
    }

    handleImageChange = (e) => {
        this.setState({
            image: e.target.files[0]
        })
    }

    render() {
        const {handleSubmit} = this.props;
        const create = this.props.type === "create"

        return (
            <div className="inner-wrap small">
                <div className="inner-header elevate">
                    <Typography variant="h5">{create ? "Register" : "Edit User"}</Typography>
                    {!create && <Link to={`/profile/${this.props.user.id}`}><Button variant="contained" color="primary">Profile</Button></Link>}
                </div>
                <div className="form">
                    <Paper elevation={3}>
                        <form onSubmit={handleSubmit(this.onSubmit)}>
                            <Grid container style={{padding: "1.5rem 2rem"}} spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Field name="first_name" component={renderTextField} label="First Name" icon={<FaceIcon/>}/>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Field name="last_name" component={renderTextField} label="Last Name"/>
                                </Grid>
                                <Grid item xs={12}>
                                    <Field name="email" component={renderTextField} label="Email" icon={<EmailIcon/>}/>
                                </Grid>
                                {create && 
                                    <Grid item xs={12}>
                                        <Field name="password" type="password" component={renderTextField} label="Password" icon={<LockIcon/>}/>
                                    </Grid> 
                                }
                                {!create && 
                                    <Grid item xs={12}>
                                        <Avatar style={{width: "70px", height: "70px"}} src={this.props.user.avatar}>
                                            {this.props.user.first_name.charAt(0)}{this.props.user.last_name.charAt(0)}
                                        </Avatar>
                                        <TextField onChange={this.handleImageChange} inputProps={{ style: {fontSize: 14}}}  type="file"/>    
                                    </Grid>
                                }
                                {this.props.errorMessage && 
                                    <Grid item xs={12}>
                                        <div className="error-message">{this.props.errorMessage}</div>
                                    </Grid>
                                }
                                <Grid item xs={12}>
                                    <Fab type="submit" variant="extended" color="primary" aria-label="login">{create ? "Register" : "Edit User"}</Fab>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </div>
            </div>
        )
    }
}

RegisterComponent.propTypes = {
    errorMessage: PropTypes.string,
    signup: PropTypes.func.isRequired,
    editUser: PropTypes.func.isRequired,
    user: userPropType
}

function mapStatetoProps(state, ownProps) {
    if (ownProps.type === "edit" && (state.user.user !== null)) {
        const user = state.user.user
        return {
            initialValues: {first_name: user.first_name, last_name: user.last_name, email: user.email}, 
            errorMessage: state.user.signupErrorMessage, 
            user: user
        }
    } else {
        return {
            errorMessage: state.user.signupErrorMessage
        }
    }
}

const mapDispatchToProps = {
    signup,
    editUser
}

export default compose (
    connect(mapStatetoProps, mapDispatchToProps),
    reduxForm({form: 'signup', validate})
)(RegisterComponent);