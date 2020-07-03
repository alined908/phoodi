import React from 'react'
import {
    Divider,
    Popper,
    ClickAwayListener,
    Grow,
    MenuList,
  } from "@material-ui/core";
import Notification from './Notification'
import styles from '../../styles/notifications.module.css'

const NotificationsDisplay = props => {

    const handleListKeyDown = event => {
        if (event.key === 'Tab') {
          event.preventDefault();
          props.handleClick()
        }
    }

    return (
        <Popper 
            open={props.open} 
            anchorEl={props.anchorRef} 
            role={undefined} 
            transition 
            disablePortal
        >
            {({ TransitionProps, placement }) => (
                <Grow
                    {...TransitionProps}
                    style={{ transformOrigin: 'center top' }}
                >
                    <div className={styles.display}>
                        <div className={styles.header}>
                            <span className={styles.headerMeta}>
                                Notifications {props.notifications.length > 0 && 
                                    `(${props.notifications.length})`
                                }
                            </span>
                            {props.notifications.length > 0 &&
                                <span className={styles.headerRead} onClick={() => props.readAllNotifs()}>
                                    Mark all as read
                                </span>
                            }
                        </div>
                        <ClickAwayListener onClickAway={props.onClose}>
                            <MenuList className={styles.menuList} autoFocusItem={true} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                                {props.notifications.length === 0 &&
                                    <div className={`${styles.empty}`}>
                                        No notifications
                                    </div>
                                }
                                {props.notifications.map((notification) => 
                                    <Notification 
                                        onClose={props.onClose}
                                        notification={notification}
                                        readNotif={props.readNotif}
                                    />
                                )}
                            </MenuList>
                        </ClickAwayListener>
                    </div>
                </Grow>
            )}
        </Popper>
    )
}

export default NotificationsDisplay