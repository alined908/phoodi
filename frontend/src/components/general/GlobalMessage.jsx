import React from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { connect } from "react-redux";
import { removeGlobalMessage } from "../../actions";
import PropTypes from "prop-types";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const GlobalMessage = (props) => {
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
    props.removeGlobalMessage();
    setOpen(true);
  };

  return (
    <div>
      {props.messages.length > 0 && (
        <Snackbar
          open={open}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          autoHideDuration={2000}
          onClose={() => handleClose()}
        >
          <Alert
            onClose={() => handleClose()}
            severity={props.messages[0].type}
          >
            {props.messages[0].message}
          </Alert>
        </Snackbar>
      )}
    </div>
  );
};

GlobalMessage.propTypes = {
  removeGlobalMessage: PropTypes.func.isRequired,
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
    })
  ),
};

const mapDispatchToProps = {
  removeGlobalMessage,
};

function mapStateToProps(state) {
  return {
    messages: state.globalMessages,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(GlobalMessage);
