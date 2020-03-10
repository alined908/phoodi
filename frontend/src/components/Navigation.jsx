import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {Button, Drawer, CssBaseline, AppBar, Toolbar, Typography, Divider, IconButton, List, ListItem, ListItemIcon, ListItemText} from '@material-ui/core'
import {Menu, ChevronLeft, ChevronRight, People, Person, Settings, Chat,Mail, Assignment, PermContactCalendar, ExitToApp}  from '@material-ui/icons';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import Body from "./Body"
import WebSocketService from "../accounts/WebSocket"
import {getNumberNotifs} from "../actions/notifications.js"
import LiveUpdatingBadge from "./LiveUpdatingBadge"
import AuthenticationService from '../accounts/AuthenticationService'

const drawerWidth = 220;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    height: '100%',
    backgroundColor: "white"
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    padding: "0 1rem",
    background: "white"
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  title: {
    color: "black",
    flexGrow: 1,
    marginLeft: '.5rem'
  },

  actionButton:{
    marginRight: '1rem'
  },
  drawerText: {
    fontSize: '.9em',
    fontWeight: '600'
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: '100%',
    height: '100%',
  },
}));

const Navigation = (props) => {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [socket, setSocket] = React.useState(new WebSocketService())
  socket.addNotifCallbacks(props.getNumberNotifs)

  React.useEffect(() => {
    console.log("component mount called")
    if (props.authenticated && open) {
      var ws_scheme = window.location.protocol === "https:" ? "wss": "ws"
      const token = AuthenticationService.retrieveToken()
      const path = `${ws_scheme}://localhost:8000/ws/user/${props.user.id}/?token=${token}`;
      socket.connect(path);
      socket.waitForSocketConnection(() => socket.fetchNotifications({user: props.user.id}))
    }

    return () => {
      if(props.authenticated && socket.exists()) {
        socket.disconnect()
      }
    }
  })

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const isActive = (uri) => {
    return window.location.pathname.indexOf(uri) > -1
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      
      <AppBar position="absolute" className={classes.appBar}>
        <Toolbar>
          {props.authenticated && <IconButton color="black" aria-label="open drawer" onClick={handleDrawerOpen} edge="start">
            <Menu />
          </IconButton>}
          <Typography className={classes.title} variant="h6" noWrap>
            <Link onClick={handleDrawerClose} to="/">Meetup</Link>
          </Typography>
          {!props.authenticated && 
            <Link to="/login">
              <Button className={classes.actionButton} startIcon={<ExitToApp/>}>Sign in</Button>
            </Link>
          }
          {!props.authenticated &&
            <Link to="/register">
              <Button className={classes.actionButton} startIcon={<Assignment/>}>Sign Up</Button>
            </Link>
          }
        </Toolbar>
      </AppBar>
      
      <Drawer className={classes.drawer} ModalProps={{keepMounted:true}} onClose={handleDrawerClose} variant="temporary" anchor="left" open={open} classes={{ paper: classes.drawerPaper,}}>
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </div>
        <Divider />
        <List>
          {props.authenticated && <Link to="/meetups" onClick={handleDrawerClose}>
                <ListItem button key="Meetups" selected={isActive("/meetups")}>
                  <ListItemIcon>
                    <LiveUpdatingBadge type={'meetup'} icon={<People/>} />
                  </ListItemIcon>
                  <ListItemText classes={{primary: classes.drawerText}} primary="Meetups"/>
                </ListItem>
              </Link>}
          {props.authenticated && <Link to="/chat" onClick={handleDrawerClose}>
              <ListItem button key="Chat" selected={isActive("/chat")}>
                <ListItemIcon>
                <LiveUpdatingBadge type={'chat'} icon={<Chat/>} />
                </ListItemIcon>
                <ListItemText classes={{primary: classes.drawerText}} primary="Chat"/>
              </ListItem>
            </Link>}
          {props.authenticated && <Link to="/friends" onClick={handleDrawerClose}>
              <ListItem button key="Friends" selected={isActive("/friends")}>
                <ListItemIcon>
                <LiveUpdatingBadge type={'friend'} icon={<PermContactCalendar/>} />
                </ListItemIcon>
                <ListItemText classes={{primary: classes.drawerText}} primary="Friends"/>
              </ListItem>
            </Link>}
          {props.authenticated && <Link to="/invites" onClick={handleDrawerClose}>
            <ListItem button key="Invites" selected={isActive("/invites")}>
              <ListItemIcon>
                <LiveUpdatingBadge type={'invite'} icon={<Mail/>}/>
              </ListItemIcon>
              <ListItemText classes={{primary: classes.drawerText}} primary="Invites"/>
            </ListItem>
          </Link>}
        </List>
        <Divider />
        <List>
          {props.authenticated && props.user && <Link to={`/profile/${props.user.id}`} onClick={handleDrawerClose}>
            <ListItem button key="Profile" selected={isActive("/profile")}>
              <ListItemIcon>
                <Person/>
              </ListItemIcon>
              <ListItemText classes={{primary: classes.drawerText}} primary="Profile"/>
            </ListItem>
          </Link>}
          {props.authenticated && <Link to="/settings" onClick={handleDrawerClose}>
            <ListItem button key="Settings" selected={isActive("/settings")}>
              <ListItemIcon>
                <Settings/>
              </ListItemIcon>
              <ListItemText classes={{primary: classes.drawerText}} primary="Settings"/>
            </ListItem>
          </Link>}
          {props.authenticated && <Link onClick={handleDrawerClose} to="/logout">
            <ListItem button key="Logout">
              <ListItemIcon>
                <ExitToApp/>
              </ListItemIcon>
              <ListItemText classes={{primary: classes.drawerText}} primary="Logout"/>
            </ListItem>
          </Link>}
        </List>
       
      </Drawer>
      <main className={classes.content}>
        <div className={classes.drawerHeader} />
        <Body></Body>
      </main>
    </div>
  );
}

function mapStatetoProps(state) {
  return {
    authenticated: state.user.authenticated,
    user: state.user.user,
  }
}

const mapDispatchToProps = {
  getNumberNotifs
}

export default connect(mapStatetoProps, mapDispatchToProps)(Navigation)