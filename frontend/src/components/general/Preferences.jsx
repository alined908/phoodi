import React, {Component} from 'react';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import {ListItem, ListItemAvatar, ListItemText, Typography, Tooltip, Avatar, IconButton} from '@material-ui/core'
import { editPreference, deletePreference} from "../../actions/index"
import {connect} from 'react-redux'
import {Delete as DeleteIcon, Edit as EditIcon} from '@material-ui/icons'

class Preferences extends Component {

    handleEdit = (pref) => {
        this.props.editPreference(this.props.user.id, pref.id)
    }

    handleDelete = (pref) => {
        this.props.deletePreference(this.props.user.id, pref.id)
    }

    onSortEnd = ({oldIndex, newIndex}) => {

    }

    render () {
        const SortablePreference = SortableElement(({props}) => {
            console.log("HFWAFWAFW")
            console.log('hello3334667')
            const pref = props.pref
            const index = props.index

            return (
                <Tooltip placement="left" title={pref.category.label}>
                    <div className="preference">
                        <ListItem>
                            <span style={{marginRight: "20px"}}>{index + 1}</span>
                            <ListItemAvatar>
                                <Avatar src={`${process.env.REACT_APP_S3_STATIC_URL}${pref.category.api_label}.png`} variant="square"/>
                            </ListItemAvatar>
                            <ListItemText primary={<Typography variant="body" style={{fontWeight: "600", fontFamily: "Lato"}}>{pref.category.label}</Typography>} >
                            </ListItemText>
                            {this.props.isUser && (!this.props.locked ?
                                <>  
                                    {/* <Tooltip title="Edit">
                                        <IconButton onClick={() => this.handleEdit(pref)} style={{color: "black"}} size="small">
                                            <EditIcon fontSize="inherit"/>
                                        </IconButton>
                                    </Tooltip> */}
                                    <Tooltip title="Delete">
                                        <IconButton onClick={() => this.handleDelete(pref)} color="secondary" size="small">
                                            <DeleteIcon fontSize="inherit"/>
                                        </IconButton>
                                    </Tooltip>
                                </>: <></>
                                )
                            }
                        </ListItem>
                    </div>
                </Tooltip>
            )
        })
        
        const SortablePreferenceList = SortableContainer(({preferences}) => {
            return (
                <div className="column-middle">
                    {preferences.map((pref, index) => (
                        <SortablePreference key={`pref-${pref.id}`} index={index} pref={pref}/>
                    ))}
                </div>
            )
        })

        return <SortablePreferenceList preferences={this.props.preferences} onSortEnd={this.onSortEnd}/>
    }
}
function mapStateToProps(state) {
    return {
        preferences: state.user.preferences
    }
}

const mapDispatchToProps = {
    editPreference,
    deletePreference
}

export default connect(mapStateToProps, mapDispatchToProps)(Preferences)