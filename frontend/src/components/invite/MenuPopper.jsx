import React from 'react';
import {Button, ClickAwayListener, Grow, Paper, Popper, MenuItem, MenuList} from "@material-ui/core"
import {inviteType, inviteStatus} from '../../constants/default-states'
import {connect} from 'react-redux'
import {respondFriendInvite, respondMeetupInvite} from "../../actions/invite"

const MenuPopper = (props) => {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);

    const handleToggle = () => {
        setOpen(prevOpen => !prevOpen);
    };

    const handleClose = event => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
        return;
        }

        setOpen(false);
    };

    const handleClick = (inv, newStatus) => {
        console.log(inv)
        props.type === inviteType.friend ? props.respondFriendInvite(inv.uri, newStatus) : props.respondMeetupInvite(inv.meetup.uri, inv.uri, newStatus)
    }

    return (
        <div>
            <Button ref={anchorRef} aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true" onClick={handleToggle}>{props.type === inviteType.friend ? "Friends" : "Meetups"}</Button>
            <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
            {({ TransitionProps, placement }) => (
                <Grow
                {...TransitionProps}
                style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                >
                <Paper>
                    <ClickAwayListener onClickAway={handleClose}>
                    <MenuList autoFocusItem={open} id="menu-list-grow">
                        {props.invites.map((inv) => 
                            <li>
                                {inv.sender.first_name} - {inv.meetup && inv.meetup.name}
                                {inv.status === 1 && 
                                    <span>
                                        <Button onClick={() => handleClick(inv, 2)} size="small" variant="contained" color="primary">Confirm</Button>
                                        <Button onClick={() => handleClick(inv, 3)} size="small" variant="contained" color="secondary">Delete</Button>
                                    </span>
                                }
                            </li>
                        )}
                    </MenuList>
                    </ClickAwayListener>
                </Paper>
                </Grow>
            )}
            </Popper>
      </div>
    )
}

const mapDispatchToProps = {
    respondFriendInvite,
    respondMeetupInvite
}

export default connect(null, mapDispatchToProps)(MenuPopper)