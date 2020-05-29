import React, {Component} from "react";
import {
  Button,
  CssBaseline,
  Typography,
  Divider,
  IconButton,
  ListItemAvatar,
  Popper,
  ClickAwayListener,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Grow,
  Menu,
  MenuItem,
  MenuList
} from "@material-ui/core";
import {
  People as PeopleIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ChatOutlined as ChatOutlinedIcon,
  MailOutlined as MailOutlinedIcon,
  PermContactCalendar as PermContactCalendarIcon,
  ExitToApp,
  EventNote as EventNoteIcon,
  Category as CategoryIcon,
  Restaurant as RestaurantIcon,
} from "@material-ui/icons";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { Body, LiveUpdatingBadge, SearchBar } from "../components";
import PropTypes from "prop-types";
import { userPropType, notifsPropType } from "../../constants/prop-types";
import styles from '../../styles/navigation.module.css'

const Navigation = props => {
  
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  const isNotifs = (notifs) => {
    let count = 0;

    for (let value of Object.values(notifs)) {
      count += value;
    }

    return count > 0;
  };

  const authenticated = props.authenticated
  const user = props.user
  const notifs = props.notifs

    return (
      <div className={styles.root}>
        <CssBaseline />

        <div className={styles.appBar}>
          <div className={styles.meta}>
            <Typography className={styles.title} variant="h5" noWrap>
              <Link to="/">
                Phoodi
              </Link>
            </Typography>
          </div>
          <div className={styles.search}>
            <SearchBar/>
          </div>
          <div className={styles.user}>
            {!authenticated && (
              <Link to="/register">
                <Button
                  className={styles.actionButton}
                  // startIcon={<Assignment />}
                  variant="contained"
                  color="primary"
                >
                  Signup
                </Button>
              </Link>
            )}
            {authenticated && (
              <div ref={anchorRef} className={styles.dropDownControl} onClick={handleToggle}>
                <Avatar src={user.avatar} >
                  {user.first_name.charAt(0)}
                  {user.last_name.charAt(0)}
                </Avatar>
                <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                  {({ TransitionProps, placement }) => (
                     <Grow
                      {...TransitionProps}
                      style={{ transformOrigin: 'center top' }}
                    >
                    <div className={styles.menu}>
                    <ClickAwayListener onClickAway={handleClose}>
                      <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                        <Link to={`/profile/${user.id}`} onClick={handleClose}>
                          <ListItem className={styles.name}>
                            <ListItemAvatar>
                              <Avatar style={{width: 30, height: 30, fontSize: "1rem", marginRight: 8}} src={props.user.avatar}>
                                {props.user.first_name.charAt(0)}
                                {props.user.last_name.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primaryTypographyProps={{
                                className: `${styles.link} ${styles.bold}`,
                              }}
                              primary={`${user.first_name} ${user.last_name}`}
                              secondary={
                                <Typography
                                  component="span"
                                  variant="body2"
                                  className={styles.email}
                                >
                                  {user.email}
                                </Typography>
                              }
                            />
                          </ListItem>
                        </Link>
                        <Divider/>
                        <Link to={`/profile/${user.id}`} onClick={handleClose}>
                          <ListItem button key="Profile">
                            <ListItemIcon>
                              <PersonIcon color="primary"/>
                            </ListItemIcon>
                            <ListItemText
                              primary="Profile"
                              primaryTypographyProps={{className: styles.link}}
                            />
                          </ListItem>
                        </Link>
                        <Link to="/meetups"  onClick={handleClose}>
                          <ListItem button key="Meetups">
                            <ListItemIcon>
                              <LiveUpdatingBadge
                                type={"meetup"}
                                icon={<PeopleIcon color="primary"/>}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary="Meetups"
                              primaryTypographyProps={{className: styles.link}}
                            />
                          </ListItem>
                        </Link>
                        <Divider/>
                        <Link to="/friends" onClick={handleClose}>
                          <ListItem button key="Friends">
                            <ListItemIcon>
                              <LiveUpdatingBadge
                                type={"friend"}
                                icon={<PermContactCalendarIcon color="primary"/>}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary="Friends"
                              primaryTypographyProps={{className: styles.link}}
                            />
                          </ListItem>
                        </Link>
                        <Link to="/chat" onClick={handleClose}>
                          <ListItem button key="Chat">
                            <ListItemIcon>
                              <LiveUpdatingBadge
                                type={"chat"}
                                icon={<ChatOutlinedIcon  color="primary"/>}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary="Chat"
                              primaryTypographyProps={{className: styles.link}}
                            />
                          </ListItem>
                        </Link>
                        <Link to="/invites" onClick={handleClose}>
                          <ListItem button key="Invites">
                            <ListItemIcon>
                              <LiveUpdatingBadge
                                type={"invite"}
                                icon={<MailOutlinedIcon color="primary"/>}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary="Invites"
                              primaryTypographyProps={{className: styles.link}}
                            />
                          </ListItem>
                        </Link>
                        <Divider/>
                        <Link to="/calendar" onClick={handleClose}>
                          <ListItem button key="Calendar">
                            <ListItemIcon>
                              <EventNoteIcon color="primary"/>
                            </ListItemIcon>
                            <ListItemText
                              primary="Calendar"
                              primaryTypographyProps={{className: styles.link}}
                            />
                          </ListItem>
                        </Link>
                        <Link to="/settings" onClick={handleClose}>
                          <ListItem button key="Settings">
                            <ListItemIcon>
                              <SettingsIcon  color="primary"/>
                            </ListItemIcon>
                            <ListItemText
                              primary="Settings"
                              primaryTypographyProps={{className: styles.link}}
                            />
                          </ListItem>
                        </Link>
                        <Link to="/logout" onClick={handleClose}>
                          <ListItem button key="Logout">
                            <ListItemIcon>
                              <ExitToApp color="primary"/>
                            </ListItemIcon>
                            <ListItemText
                              primary="Logout"
                              primaryTypographyProps={{className: styles.link}}
                            />
                          </ListItem>
                        </Link>
                      </MenuList>
                    </ClickAwayListener>
                    </div>
                  </Grow>
                )}
                </Popper>
              </div>
            )}
          </div>
        </div>

      {/* 
        <Link to="/restaurants" onClick={handleDrawerClose}>
          <ListItem
            button
            key="Restaurants"
          >
            <ListItemIcon>
              <RestaurantIcon className={classes.icon} />
            </ListItemIcon>
            <ListItemText
              classes={{ primary: classes.drawerText }}
              primary="Restaurants"
            />
          </ListItem>
        </Link>

        <Link to="/categories" onClick={handleDrawerClose}>
          <ListItem
            button
            key="Categories"
          >
            <ListItemIcon>
              <CategoryIcon className={classes.icon} />
            </ListItemIcon>
            <ListItemText
              classes={{ primary: classes.drawerText }}
              primary="Categories"
            />
          </ListItem>
        </Link>
          
      */}
        <main className={styles.content}>
          <Body />
        </main>
    </div>
  )

}

Navigation.propTypes = {
  authenticated: PropTypes.string,
  user: userPropType,
  notifs: notifsPropType,
};

function mapStatetoProps(state) {
  return {
    authenticated: state.user.authenticated,
    user: state.user.user,
    notifs: state.notifs,
  };
}

export default connect(mapStatetoProps)(Navigation);
