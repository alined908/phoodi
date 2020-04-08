import React from "react"
import {Check as CheckIcon} from '@material-ui/icons';
import {IconButton, CircularProgress, makeStyles} from "@material-ui/core"
import { green } from '@material-ui/core/colors';
import PropTypes from 'prop-types'

const useStyles = makeStyles(theme => ({
    root: {
      display: 'flex',
      alignItems: 'center',
    },
    wrapper: {
      position: 'relative',
    },
    fabProgress: {
        color: green[500],
        position: 'absolute',
        top: -15,
        left: -1,
        zIndex: 1,
      },
    check: {
        color: green[500]
    },
    normal: {
        color: "black"
    }
  }));

const ProgressIcon = (props) => {
    const [loading, setLoading] = React.useState(false)
    const [success, setSuccess] = React.useState(false);
    const classes = useStyles();
    const timer = React.useRef();

    React.useEffect(() => {
        setSuccess(false)
        return () => {
          clearTimeout(timer.current);
        };
      }, [props.disabled]);

    const handleClick = (e, callback) => {
        e.preventDefault()
        if (!loading) {
            setSuccess(false);
            setLoading(true);
            timer.current = setTimeout(() => {
                setLoading(false);
                setSuccess(true);
              }, 1000);
        }
        callback()
    }

    return (
        <span className={classes.wrapper}>
            <IconButton 
                onClick={(event) => handleClick(event, props.handleClick)} color={props.color}
                aria-label={props.ariaLabel} className={"" + ((props.check && success) ? classes.check : classes.normal)}
                disabled={loading || (props.check && (success || props.disabled))}
            >
                {(success && !props.disabled && props.check) ? <CheckIcon/> : props.icon}
            </IconButton>
            {loading && <CircularProgress size={50} className={classes.fabProgress} />}
        </span>
    )
}

ProgressIcon.propTypes = {
    disabled: PropTypes.bool,
    handleClick: PropTypes.func,
    icon: PropTypes.any,
    ariaLabel: PropTypes.string,
    color: PropTypes.string,
    check: PropTypes.bool,
}

export default ProgressIcon