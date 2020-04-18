import React, {Component} from 'react';
import {reduxForm, Field} from 'redux-form';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {signup, editUser} from "../../actions/index"
import {Paper, Grid, Fab, Button, TextField, Avatar} from '@material-ui/core';
import {ReactComponent as Together} from "../../assets/svgs/undraw_eating_together.svg"
import {ReactComponent as Bamboo} from "../../assets/svgs/bamboo-dark.svg"
import {ReactComponent as Google} from "../../assets/svgs/google.svg"
import {ReactComponent as Facebook} from "../../assets/svgs/facebook.svg"
import {ReactComponent as Twitter} from "../../assets/svgs/twitter.svg"
import {renderTextField} from '../components'
import {Link} from "react-router-dom"
import PropTypes from "prop-types"
import {userPropType} from "../../constants/prop-types"
import styles from "../../form.module.css"

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
            <Paper className={styles.container} elevation={8}>
                <div className={styles.left}>
                    <Together height="70%" width="70%"/>
                </div>
                <div className={styles.right}>
                    <div className={styles.formhead}>
                        <div className={styles.icon}>
                            <Bamboo height="100%" width="100%"/>
                        </div>
                        <span className={styles.header}>
                            {create ? "Register" : "Edit User"}
                        </span>
                        <div className={styles.icon}>
                            <Bamboo height="100%" width="100%"/>
                        </div>
                        {!create && 
                            <Link to={`/profile/${this.props.user.id}`}>
                                <Button variant="contained" color="primary">
                                    Profile
                                </Button>
                            </Link>
                        }
                    </div>
                    <form className={styles.form} onSubmit={handleSubmit(this.onSubmit)}>
                        <Grid container spacing={1}>
                            <Grid item xs={12} sm={6} className={styles.indent}>
                                <Field name="first_name" component={renderTextField} label="First Name"/>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Field name="last_name" component={renderTextField} label="Last Name"/>
                            </Grid>
                            <Grid item xs={12}>
                                <Field name="email" component={renderTextField} label="Email" />
                            </Grid>
                            {create && 
                                <Grid item xs={12}>
                                    <Field name="password" type="password" component={renderTextField} label="Password"/>
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
                        </Grid>
                        <div className={styles.fab}>
                            <Fab className={styles.button} type="submit" variant="extended" color="primary" aria-label="login">{create ? "Register" : "Edit User"}</Fab>
                        </div>
                    </form>
                    <div className={styles.bottom}>
                    <div className={styles.socials}>
                            <div className={styles.social}>
                                <Google width={40} height={40}/>
                            </div>
                            <div className={styles.social}>
                                <Facebook width={40} height={40}/>
                            </div>
                            <div className={styles.social}>
                                <Twitter  width={40} height={40}/>
                            </div>
                        </div>
                        <div className={styles.action}>
                            Already Have An Account? 
                            <span className={styles.link}>
                                <Link to="/login">Login</Link>
                            </span>
                        </div>
                    </div>
                </div>
            </Paper> 
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