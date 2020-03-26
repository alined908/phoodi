import React from 'react';
import {connect} from 'react-redux';
import {ListItem, ListItemAvatar, ListItemText, Typography, Tooltip, Avatar, IconButton} from '@material-ui/core'
import {Delete as DeleteIcon, Edit as EditIcon} from '@material-ui/icons'
import { editPreference, deletePreference} from "../../actions/index"

const Preference = ({pref, sortIndex, locked, isUser, user, ...props}) => {
    const handleEdit = (pref) => {
        props.editPreference(user.id, pref.id)
    }

    const handleDelete = (pref, user) => {
        console.log("handle delete")
        props.deletePreference(user.id, pref.id)
    }

    return (
        <Tooltip placement="left" title={pref.category.label}>
            <div className="preference">
                <ListItem>
                    <span style={{marginRight: "20px"}}>{sortIndex + 1}</span>
                    <ListItemAvatar>
                        <Avatar src={`${process.env.REACT_APP_S3_STATIC_URL}${pref.category.api_label}.png`} variant="square"/>
                    </ListItemAvatar>
                    <ListItemText primary={<Typography variant="body" style={{fontWeight: "600", fontFamily: "Lato"}}>{pref.category.label}</Typography>} >
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

const mapDispatchToProps = {
    editPreference,
    deletePreference
}

export default connect(null, mapDispatchToProps)(Preference)