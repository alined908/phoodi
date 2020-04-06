import React from 'react';
import {connect} from 'react-redux';
import {ListItem, ListItemAvatar, ListItemText, Typography, Tooltip, Avatar, IconButton, makeStyles} from '@material-ui/core'
import {Delete as DeleteIcon} from '@material-ui/icons'
import { editPreference, deletePreference} from "../../actions/index"
import PropTypes from "prop-types"
import {preferencePropType} from "../../constants/prop-types"

const useStyles = makeStyles(({
    listItem: {
        paddingTop: ".75rem",
        paddingBottom: ".75rem"
    }
  }));

const Preference = ({pref, sortIndex, locked, isUser, user, ...props}) => {
    // const handleEdit = (pref) => {
    //     props.editPreference(user.id, pref.category.id)
    // }
    const classes = useStyles();
    const handleDelete = (pref, user) => {
        props.deletePreference(user.id, pref.category.id)
    }

    return (
        <Tooltip placement="left" title={pref.category.label}>
            <div className="preference">
                <ListItem className={classes.listItem}>
                    <span style={{marginRight: "20px"}}>{sortIndex + 1}</span>
                    <ListItemAvatar>
                        <Avatar style={{width: 30, height: 30}} src={`${process.env.REACT_APP_S3_STATIC_URL}${pref.category.api_label}.png`} variant="square"/>
                    </ListItemAvatar>
                    <ListItemText primary={<Typography variant="body2" style={{fontWeight: "600", fontFamily: "Lato"}}>{pref.category.label}</Typography>} >
                    </ListItemText>
                    {((isUser && locked) &&
                        <>  
                            {/* <Tooltip title="Edit">
                                <IconButton onClick={() => handleEdit(pref)} style={{color: "black"}} size="small">
                                    <EditIcon fontSize="inherit"/>
                                </IconButton>
                            </Tooltip> */}
                            <Tooltip title="Delete">
                                <IconButton onClick={() => handleDelete(pref, user)} color="secondary" size="small">
                                    <DeleteIcon fontSize="inherit"/>
                                </IconButton>
                            </Tooltip>
                        </>
                    )
                    }
                </ListItem>
            </div>
        </Tooltip>
    )
}

Preference.propTypes = {
    isUser: PropTypes.bool.isRequired,
    locked: PropTypes.bool.isRequired,
    sortIndex: PropTypes.number.isRequired,
    pref: preferencePropType,
    editPreference: PropTypes.func.isRequired,
    deletePreference: PropTypes.func.isRequired

}

const mapDispatchToProps = {
    editPreference,
    deletePreference
}

export default connect(null, mapDispatchToProps)(Preference)