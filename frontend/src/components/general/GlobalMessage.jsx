import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import {connect} from 'react-redux'
import {removeGlobalMessage} from "../../actions/globalMessages"

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const GlobalMessage = (props) => {
  const [open, setOpen] = React.useState(true);

  const handleClose = () => {
    setOpen(false);
    props.removeGlobalMessage()
    setOpen(true);
  };

  return (
    <div>
        {props.messages.length > 0 && 
            <Snackbar open={open} anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
                }} autoHideDuration={2000} onClose={() => handleClose()}>
                <Alert onClose={() => handleClose()} severity={props.messages[0].type}>
                    {props.messages[0].message}
                </Alert>
            </Snackbar> 
        } 
    </div>
  );
}

const mapDispatchToProps = {
    removeGlobalMessage
}

function mapStateToProps(state) {
    return {
        messages: state.messages
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GlobalMessage)
