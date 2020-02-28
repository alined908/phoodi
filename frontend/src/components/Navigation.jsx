import React from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {Button, Drawer, CssBaseline, AppBar, Toolbar, Typography, Divider, IconButton, List, ListItem, ListItemIcon, ListItemText} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import PeopleIcon from '@material-ui/icons/People';
import ChatIcon from '@material-ui/icons/Chat';
import PermContactCalendarIcon from '@material-ui/icons/PermContactCalendar';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import MailIcon from '@material-ui/icons/Mail';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import Body from "./Body"
import PersonIcon from '@material-ui/icons/Person';
import WebSocketService from "../accounts/WebSocket"
import {getNumberNotifs} from "../actions/notifications.js"
import LiveUpdatingBadge from "./LiveUpdatingBadge"
import HomeIcon from '@material-ui/icons/Home';
import SettingsIcon from '@material-ui/icons/Settings';
import AssignmentIcon from '@material-ui/icons/Assignment';

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
    background: "transparent",
    boxShadow: "none",
    padding: "0 1rem",
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
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

  menuButton: {
    marginRight: '2rem'
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
    marginLeft: -drawerWidth,
    height: '92%'
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));

const Navigation = (props) => {
  const classes = useStyles();
  const theme = useTheme();
  var drawerState = (localStorage.getItem("drawer") === null) ? drawerState = false : JSON.parse(localStorage.getItem("drawer"))
  const [open, setOpen] = React.useState(drawerState);

  React.useEffect(() => {
    if (props.user && props.authenticated) {
      const socket= new WebSocketService()
      socket.addNotifCallbacks(props.getNumberNotifs)
      var ws_scheme = window.location.protocol === "https:" ? "wss": "ws"
      const path = `${ws_scheme}://localhost:8000/ws/user/${props.user.id}/`;
      socket.connect(path);
      console.log(socket.state())
      socket.waitForSocketConnection(() => socket.fetchNotifications({user: props.user.id}))
    }
  })

  const handleDrawerOpen = () => {
    localStorage.setItem("drawer", "true")
    setOpen(true);
  };

  const handleDrawerClose = () => {
    localStorage.setItem("drawer", "false")
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={clsx(classes.appBar, {[classes.appBarShift]: open,})}>
        <Toolbar>
          {props.authenticated && <IconButton color="black" aria-label="open drawer" onClick={handleDrawerOpen} edge="start" className={clsx(classes.menuButton, open && classes.hide)}>
            <MenuIcon />
          </IconButton>}
          {/* <img className="bar-img" src={require('../assets/ice-cream.svg')}/> */}
          <Typography className={classes.title} variant="h6" noWrap>
            <Link to="/">Meetup</Link>
          </Typography>
          {!props.authenticated && 
            <Link to="/login">
              <Button className={classes.actionButton} startIcon={<ExitToAppIcon/>}>Sign in</Button>
            </Link>
          }
          {!props.authenticated &&
            <Link to="/register">
              <Button className={classes.actionButton} startIcon={<AssignmentIcon/>}>Sign Up</Button>
            </Link>
          }
        </Toolbar>
      </AppBar>
      <Drawer className={classes.drawer} variant="persistent" anchor="left" open={open} classes={{ paper: classes.drawerPaper,}}>
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        <Divider />
        <List>
          <Link to="/">
            <ListItem button key="Home">
              <ListItemIcon>
                <HomeIcon/>
              </ListItemIcon>
              <ListItemText classes={{primary: classes.drawerText}} primary="Home"/>
            </ListItem>
          </Link>
          {props.authenticated && <Link to="/meetups">
                <ListItem button key="Meetups">
                  <ListItemIcon>
                    <LiveUpdatingBadge type={'meetup'} icon={<PeopleIcon/>} />
                  </ListItemIcon>
                  <ListItemText classes={{primary: classes.drawerText}} primary="Meetups"/>
                </ListItem>
              </Link>}
          {props.authenticated && <Link to="/chat">
              <ListItem button key="Chat">
                <ListItemIcon>
                <LiveUpdatingBadge type={'chat'} icon={<ChatIcon/>} />
                </ListItemIcon>
                <ListItemText classes={{primary: classes.drawerText}} primary="Chat"/>
              </ListItem>
            </Link>}
          {props.authenticated && <Link to="/friends">
              <ListItem button key="Friends">
                <ListItemIcon>
                  <PermContactCalendarIcon/>
                </ListItemIcon>
                <ListItemText classes={{primary: classes.drawerText}} primary="Friends"/>
              </ListItem>
            </Link>}
          {props.authenticated && <Link to="/invites">
            <ListItem button key="Invites">
              <ListItemIcon>
                <LiveUpdatingBadge type={'invite'} icon={<MailIcon/>}/>
              </ListItemIcon>
              <ListItemText classes={{primary: classes.drawerText}} primary="Invites"/>
            </ListItem>
          </Link>}
        </List>
        
        <Divider />
        <List>
          {props.authenticated && props.user && <Link to={`/profile/${props.user.id}`}>
            <ListItem button key="Profile">
              <ListItemIcon>
                <PersonIcon/>
              </ListItemIcon>
              <ListItemText classes={{primary: classes.drawerText}} primary="Profile"/>
            </ListItem>
          </Link>}
          {props.authenticated && <Link to="/settings">
            <ListItem button key="Settings">
              <ListItemIcon>
                <SettingsIcon/>
              </ListItemIcon>
              <ListItemText classes={{primary: classes.drawerText}} primary="Settings"/>
            </ListItem>
          </Link>}
          {props.authenticated && <Link to="/logout">
            <ListItem button key="Logout">
              <ListItemIcon>
                <ExitToAppIcon/>
              </ListItemIcon>
              <ListItemText classes={{primary: classes.drawerText}} primary="Logout"/>
            </ListItem>
          </Link>}
        </List>
       
      </Drawer>
      <main className={clsx(classes.content, {[classes.contentShift]: open,})}>
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