import React from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {Drawer, CssBaseline, AppBar, Toolbar, Typography, Divider, IconButton, List, ListItem, ListItemIcon, ListItemText} from '@material-ui/core'
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

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    height: '100%'
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
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
    marginLeft: -drawerWidth,
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
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={clsx(classes.appBar, {[classes.appBarShift]: open,})}>
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" onClick={handleDrawerOpen} edge="start" className={clsx(classes.menuButton, open && classes.hide)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            <Link to="/">Meetup</Link>
          </Typography>
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
          {props.authenticated && <Link to="/meetups">
                <ListItem button key="Meetups">
                  <ListItemIcon>
                    <PeopleIcon/>
                  </ListItemIcon>
                  <ListItemText primary="Meetups"/>
                </ListItem>
              </Link>}
          {props.authenticated && <Link to="/chat">
              <ListItem button key="Chat">
                <ListItemIcon>
                  <ChatIcon/>
                </ListItemIcon>
                <ListItemText primary="Chat"/>
              </ListItem>
            </Link>}
          {props.authenticated && <Link to="/friends">
              <ListItem button key="Friends">
                <ListItemIcon>
                  <PermContactCalendarIcon/>
                </ListItemIcon>
                <ListItemText primary="Friends"/>
              </ListItem>
            </Link>}
          {props.authenticated && <Link to="/invites">
            <ListItem button key="Invites">
              <ListItemIcon>
                <MailIcon/>
              </ListItemIcon>
              <ListItemText primary="Invites"/>
            </ListItem>
          </Link>}
        </List>
        <Divider />
        <List>
          {!props.authenticated && <Link to="/login"><ListItem button key="Login"><ListItemText primary="Login"/></ListItem></Link>}
          {!props.authenticated && <Link to="/register"><ListItem button key="Register"><ListItemText primary="Register"/></ListItem></Link>}
          {props.authenticated && props.user && <Link to={`/profile/${props.user.id}`}>
            <ListItem button key="Profile">
              <ListItemIcon>
                <PersonIcon/>
              </ListItemIcon>
              <ListItemText primary="Profile"/>
            </ListItem>
          </Link>}
          {props.authenticated && <Link to="/logout">
            <ListItem button key="Logout">
              <ListItemIcon>
                <ExitToAppIcon/>
              </ListItemIcon>
              <ListItemText primary="Logout"/>
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
    user: state.user.user
  }
  
}

export default connect(mapStatetoProps, null)(Navigation)