import React from "react";
import { connect } from "react-redux";
import {
  Typography,
  Tooltip,
  Avatar,
  IconButton
} from "@material-ui/core";
import { Delete as DeleteIcon } from "@material-ui/icons";
import { editPreference, deletePreference } from "../../actions";
import PropTypes from "prop-types";
import { preferencePropType } from "../../constants/prop-types";
import styles from "../../styles/category.module.css";


const Preference = ({ pref, sortIndex, locked, isUser, user, ...props }) => {
  // const handleEdit = (pref) => {
  //     props.editPreference(user.id, pref.category.id)
  // }
  const handleDelete = (pref, user) => {
    props.deletePreference(user.id, pref.category.id);
  };

  return (
      <div className={styles.preference}>
          <div className={styles.preferenceInfo}>
            <span className={styles.preferenceRank}>
              {sortIndex + 1}
            </span>
            <Avatar
              variant="square"
              className={styles.preferenceAvatar}
              src={`${process.env.REACT_APP_S3_STATIC_URL}/static/category/${pref.category.api_label}.png`}
            />
            <Typography variant="body2">{pref.category.label}</Typography>
          </div>
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
      </div>
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
