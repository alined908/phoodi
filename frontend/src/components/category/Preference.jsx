import React from "react";
import { connect } from "react-redux";
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Tooltip,
  Avatar,
  IconButton,
  makeStyles,
} from "@material-ui/core";
import { Delete as DeleteIcon } from "@material-ui/icons";
import { editPreference, deletePreference } from "../../actions";
import PropTypes from "prop-types";
import { preferencePropType } from "../../constants/prop-types";
import styles from "../../styles/category.module.css";

const useStyles = makeStyles({
  listItem: {
    paddingTop: ".75rem",
    paddingBottom: ".75rem",
  },
});

const Preference = ({ pref, sortIndex, locked, isUser, user, ...props }) => {
  // const handleEdit = (pref) => {
  //     props.editPreference(user.id, pref.category.id)
  // }
  const classes = useStyles();
  const handleDelete = (pref, user) => {
    props.deletePreference(user.id, pref.category.id);
  };

  return (
    <Tooltip placement="left" title={pref.category.label}>
      <div className={styles.preference}>
        <ListItem className={classes.listItem}>
          <span className={styles.preferenceRank}>{sortIndex + 1}</span>
          <ListItemAvatar>
            <Avatar
              variant="square"
              className={styles.preferenceAvatar}
              src={`${process.env.REACT_APP_S3_STATIC_URL}${pref.category.api_label}.png`}
            />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="body2">{pref.category.label}</Typography>
            }
          ></ListItemText>
          {isUser && locked && (
            <>
              {/* <Tooltip title="Edit">
                                <IconButton onClick={() => handleEdit(pref)} style={{color: "black"}} size="small">
                                    <EditIcon fontSize="inherit"/>
                                </IconButton>
                            </Tooltip> */}
              <Tooltip title="Delete">
                <IconButton
                  onClick={() => handleDelete(pref, user)}
                  color="secondary"
                  size="small"
                >
                  <DeleteIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </ListItem>
      </div>
    </Tooltip>
  );
};

Preference.propTypes = {
  isUser: PropTypes.bool.isRequired,
  locked: PropTypes.bool.isRequired,
  sortIndex: PropTypes.number.isRequired,
  pref: preferencePropType,
  editPreference: PropTypes.func.isRequired,
  deletePreference: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  editPreference,
  deletePreference,
};

export default connect(null, mapDispatchToProps)(Preference);
