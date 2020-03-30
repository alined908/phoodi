import React from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {Button, Drawer, CssBaseline, withStyles, AppBar, Toolbar, Typography, Divider, IconButton, ListItemAvatar, Avatar, List, ListItem, ListItemIcon, Badge, ListItemText} from '@material-ui/core'
import {Menu, ChevronLeft, ChevronRight, People as PeopleIcon, 
  Person as PersonIcon, Settings as SettingsIcon, ChatOutlined as ChatOutlinedIcon, MailOutlined as MailOutlinedIcon, 
  Assignment, PermContactCalendar as PermContactCalendarIcon, ExitToApp, EventNote as EventNoteIcon, Category as CategoryIcon}  from '@material-ui/icons';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {Body, LiveUpdatingBadge} from '../components'

const drawerWidth = 220;

const StyledBadge = withStyles((theme) => ({
  badge: {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: '$ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
    right: "28%"
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}))(Badge);

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
    
    background: "white",
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
    marginLeft: '.5rem',
    fontWeight: "600",
    fontFamily: "Lato",
  },
  icon: {
    color: "#03396c"
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
  primary: {
    fontWeight: 600,
    fontFamily: "Lato",
    fontSize: ".9rem"
  },
  self: {
    marginTop: "auto"
  },
  secondary: {
    fontWeight: 600,
    fontFamily: "Lato",
    fontSize: ".75rem"
  }
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

  const isActive = (uri) => {
    return window.location.pathname.indexOf(uri) > -1
  }

  const isNotifs = (notifs) => {
    let count = 0;

    for(let value of Object.values(notifs)){
      count += value
    }

    return count > 0;
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      
      <AppBar position="absolute" className={classes.appBar}>
        <Toolbar>
          {props.authenticated && <IconButton aria-label="open drawer" onClick={handleDrawerOpen} edge="start">
            <Badge color="secondary" variant="dot" invisible={!isNotifs(props.notifs)}><Menu /></Badge>
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
                    <LiveUpdatingBadge type={'meetup'} icon={<PeopleIcon className={classes.icon}/>} />
                  </ListItemIcon>
                  <ListItemText classes={{primary: classes.drawerText}} primary="Meetups"/>
                </ListItem>
              </Link>}
            {props.authenticated && <Link to="/category" onClick={handleDrawerClose}>
                <ListItem button key="Categories" selected={isActive("/category")}>
                  <ListItemIcon>
                    <CategoryIcon className={classes.icon}/>
                  </ListItemIcon>
                  <ListItemText classes={{primary: classes.drawerText}} primary="Categories"/>
                </ListItem>
            </Link>}
          {props.authenticated && <Link to="/calendar" onClick={handleDrawerClose}>
                <ListItem button key="Calendar" selected={isActive("/calendar")}>
                  <ListItemIcon>
                    <EventNoteIcon className={classes.icon}/>
                  </ListItemIcon>
                  <ListItemText classes={{primary: classes.drawerText}} primary="Calendar"/>
                </ListItem>
            </Link>}
          {props.authenticated && <Link to="/friends" onClick={handleDrawerClose}>
              <ListItem button key="Friends" selected={isActive("/friends")}>
                <ListItemIcon>
                <LiveUpdatingBadge type={'friend'} icon={<PermContactCalendarIcon className={classes.icon}/>} />
                </ListItemIcon>
                <ListItemText classes={{primary: classes.drawerText}} primary="Friends"/>
              </ListItem>
            </Link>}
          {props.authenticated && <Link to="/chat" onClick={handleDrawerClose}>
              <ListItem button key="Chat" selected={isActive("/chat")}>
                <ListItemIcon>
                <LiveUpdatingBadge type={'chat'} icon={<ChatOutlinedIcon className={classes.icon}/>} />
                </ListItemIcon>
                <ListItemText classes={{primary: classes.drawerText}} primary="Chat"/>
              </ListItem>
            </Link>}
          
          {props.authenticated && <Link to="/invites" onClick={handleDrawerClose}>
            <ListItem button key="Invites" selected={isActive("/invites")}>
              <ListItemIcon>
                <LiveUpdatingBadge type={'invite'} icon={<MailOutlinedIcon className={classes.icon}/>}/>
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
                <PersonIcon className={classes.icon}/>
              </ListItemIcon>
              <ListItemText classes={{primary: classes.drawerText}} primary="Profile"/>
            </ListItem>
          </Link>}
          {props.authenticated && <Link to="/settings" onClick={handleDrawerClose}>
            <ListItem button key="Settings" selected={isActive("/settings")}>
              <ListItemIcon>
                <SettingsIcon className={classes.icon}/>
              </ListItemIcon>
              <ListItemText classes={{primary: classes.drawerText}} primary="Settings"/>
            </ListItem>
          </Link>}
          {props.authenticated && <Link onClick={handleDrawerClose} to="/logout">
            <ListItem button key="Logout">
              <ListItemIcon>
                <ExitToApp className={classes.icon}/>
              </ListItemIcon>
              <ListItemText classes={{primary: classes.drawerText}} primary="Logout"/>
            </ListItem>
          </Link>}
        </List>
        <Divider />
        {props.authenticated && 
          <ListItem className={classes.self}>
            <ListItemAvatar>
              <StyledBadge
                  overlap="circle"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  variant="dot"
                >
                <Avatar className={classes.avatar} src={props.user.avatar}>
                  {props.user.first_name.charAt(0)}{props.user.last_name.charAt(0)}
                </Avatar>
              </StyledBadge>
            </ListItemAvatar>
            <ListItemText 
                primaryTypographyProps={{className: classes.primary}}
                primary={props.user.first_name + " " + props.user.last_name} 
                secondary={
                    <>
                        <Typography className={classes.secondary} component="span" color="inherit" variant="body2"> 
                            {props.user.email + " "}
                        </Typography>
                    </>
                }
            >
            </ListItemText>
          </ListItem>
        }
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
    notifs: state.notifs
  }
}

export default connect(mapStatetoProps)(Navigation)