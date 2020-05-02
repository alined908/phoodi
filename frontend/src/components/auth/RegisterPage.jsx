import React, {Component} from 'react';
import {reduxForm, Field} from 'redux-form';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {signup, editUser, removeSuccessMessage} from "../../actions"
import {Paper, Grid, Fab, Button, Avatar, Dialog, DialogActions, DialogTitle, DialogContent} from '@material-ui/core';
import {ReactComponent as Together} from "../../assets/svgs/undraw_eattogether.svg"
import {ReactComponent as Bamboo} from "../../assets/svgs/bamboo-dark.svg"
import {ReactComponent as Google} from "../../assets/svgs/google.svg"
import {ReactComponent as Facebook} from "../../assets/svgs/facebook.svg"
import {ReactComponent as Twitter} from "../../assets/svgs/twitter.svg"
import {renderTextField} from '../components'
import {Link} from "react-router-dom"
import PropTypes from "prop-types"
import {userPropType} from "../../constants/prop-types"
import styles from "../../styles/form.module.css"
import {Helmet} from "react-helmet"

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

class RegisterPage extends Component {

    constructor(props){
        super(props)
        this.state = {
            image: null,
            imageURL: ""
        }
        this.handleImageChange = this.handleImageChange.bind(this)
    }

    onSubmit = formProps => {
        let data = new FormData()
        for(var key in formProps) {
            data.append(key.toString(), formProps[key])
        }
        if (this.state.image !== null) {
            data.append('avatar', this.state.image, this.state.image.name)
        } 

        let redirect;
        if (this.props.location.state && this.props.location.state.from) {
            redirect = () => {
                this.props.history.push(this.props.location.state.from)
            }
        } else {
            redirect = () => {
                this.props.history.push("/meetups")
            }
        }
        if (this.props.type === "create") {
            this.props.signup(data, redirect);
        }

        if (this.props.type === "edit") {
            this.props.editUser(data, this.props.user.id, () => this.props.handleClose())
        }
       
    }

    componentWillUnmount(){
        this.props.removeSuccessMessage()
    }

    handleImageChange = (e) => {
        var reader = new FileReader()
        let file = e.target.files[0]

        reader.onloadend = () => {
            this.setState({
                image: file,
                imageURL: reader.result
            })
        }

        reader.readAsDataURL(file)
    }

    render() {
        const {handleSubmit, submitting, invalid} = this.props;
        const create = this.props.type === "create"
        
        return (
            <>
                {create ? 
                    <Paper className={styles.container} elevation={8}>
                        <Helmet>
                            <meta charSet="utf-8" />
                            <title>
                                Register
                            </title>
                        </Helmet>
                        <div className={styles.left}>
                            <Together height="70%" width="70%"/>
                        </div>
                        <div className={styles.right}>
                            <div className={styles.formhead}>
                                <div className={styles.icon}>
                                    <Bamboo height="100%" width="100%"/>
                                </div>
                                <span className={styles.header}>
                                    Register
                                </span>
                                <div className={styles.icon}>
                                    <Bamboo height="100%" width="100%"/>
                                </div>
                            </div>
                            <form className={styles.form} onSubmit={handleSubmit(this.onSubmit)}>
                                <Grid container spacing={1}>
                                    <Grid item xs={12} sm={6} className={styles.indent}>
                                        <Field required name="first_name" component={renderTextField} label="First Name"/>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Field required name="last_name" component={renderTextField} label="Last Name"/>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Field required name="email" component={renderTextField} label="Email" />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Field required name="password" type="password" component={renderTextField} label="Password"/>
                                    </Grid> 
                                    {this.props.errorMessage && 
                                        <Grid item xs={12}>
                                            <div className={styles.error}>
                                                {this.props.errorMessage}
                                            </div>
                                        </Grid>
                                    }
                                    {this.props.successMessage && 
                                        <Grid item xs={12}>
                                            <div className={styles.success}>
                                                {this.props.successMessage}
                                            </div>
                                        </Grid>
                                    }
                                </Grid>
                                <div className={styles.fab}>
                                    <Fab type="submit" variant="extended" color="primary" aria-label="login">
                                        Register
                                    </Fab>
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
                    </Paper> :
                    <Dialog open={this.props.open} onClose={this.props.handleClose}>
                        <DialogTitle>
                            Edit Profile
                        </DialogTitle>
                        <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                            <DialogContent dividers>
                                <Grid container spacing={1}>
                                    <Grid item xs={12} sm={6} className={styles.indent}>
                                        <Field required name="first_name" component={renderTextField} label="First Name"/>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Field required name="last_name" component={renderTextField} label="Last Name"/>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Field required name="email" component={renderTextField} label="Email" />
                                    </Grid>
                                    {/* <Grid item xs={12}>
                                        <Field required name="password" type="password" component={renderTextField} label="Password"/>
                                    </Grid>  */}
                                    <Grid item xs={12}>
                                        <div className={styles.avatarlabel}>Avatar</div>
                                        <div className={styles.avatar}>
                                            <Avatar className={styles.avatarBig} src={this.props.user.avatar}>
                                                {this.props.user.first_name.charAt(0)}{this.props.user.last_name.charAt(0)}
                                            </Avatar>
                                            <input onChange={this.handleImageChange} id="icon-button-file" type="file" className={styles.none}/> 
                                            <label htmlFor="icon-button-file">
                                                <Button aria-label="upload" color="primary" component="span">
                                                    Upload
                                                </Button>
                                            </label>
                                            <span>
                                                {this.state.image && `New Profile Picture --> ${this.state.image.name}`}
                                            </span>  
                                            {this.state.image && 
                                                <Avatar className={styles.avatarBig} src={this.state.imageURL}></Avatar>
                                            }
                                        </div> 
                                    </Grid>
                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={this.props.handleClose} color="secondary" disabled={submitting}>
                                    Close
                                </Button>
                                <Button type="submit" color="primary" aria-label="add" disabled={invalid || submitting}>
                                    Edit Profile
                                </Button>
                            </DialogActions>
                        </form>
                    </Dialog>
                }
            </>
        )
    }
}

RegisterPage.propTypes = {
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
            errorMessage: state.user.signupErrorMessage,
            successMessage: state.user.signupSuccessMessage
        }
    }
}

const mapDispatchToProps = {
    signup,
    editUser,
    removeSuccessMessage
}

export default compose (
    connect(mapStatetoProps, mapDispatchToProps),
    reduxForm({form: 'signup', validate})
)(RegisterPage);