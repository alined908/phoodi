export const userDefaultState = {
  loginErrorMessage: "",
  signUpErrorMessage: "",
  friends: [],
  isFriendsInitialized: false,
  invites: {
    meetups: [],
    friends: [],
    isMeetupInvitesInitialized: false,
    isFriendInvitesInitialized: false,
  },
  preferences: [],
};

export const inviteType = {
  friend: 0,
  meetup: 1,
};

export const inviteStatus = {
  1: "OPEN",
  2: "ACCEPTED",
  3: "REJECTED",
};

export const roomType = {
  friend: 2,
  meetup: 1,
};

export const voteStatus = {
  like: 1,
  dislike: 2,
  ban: 3,
};

const bold = {
  fontWeight: 600,
};

export const MuiTheme = {
  typography: {
    fontFamily: [
      "Lato",
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: bold,
    h2: bold,
    h3: bold,
    h4: {...bold, fontSize: "1.3rem"},
    h5: { ...bold, fontSize: "1.15rem" },
    h6: { ...bold, fontSize: ".95rem" },
    body1: { ...bold, fontSize: ".85rem" },
    body2: { ...bold, fontSize: ".8rem" },
    button: { ...bold, fontSize: ".75rem" },
  },
  overrides: {
    MuiButton: {
      sizeSmall: {
        fontSize: ".7rem",
      },
    },
    MuiFab : {
        root: {
            background: "rgba(10,10,10, .95) !important",
            color: "white !important",
            '&:hover': {
                background: "black !important"
            }
        }
    },
    MuiAvatar: {
      root: {
        fontFamily: "Arial",
        fontSize: "1.15rem",
        marginRight: 5,
      },
    },
    MuiListItemIcon : {
        root: {
            minWidth: 35
        }
    },
    MuiTooltip: {
      tooltip: {
        backgroundColor: "rgba(16,16,16, .8)",
        color: "white",
      },
    },
    MuiCircularProgress: {
      colorPrimary: {
        color: "black",
      }
    },
    MuiChip: {
      root: {
        padding: "3px 4px",
        fontSize: ".75rem",
        borderRadius: "4px",
        backgroundColor: "#3f51b5",
        color: "white",
        margin: ".25rem",
        letterSpacing: "0.02857em",
        textTransform: "capitalize",
        boxShadow:
          "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
      },
    },
  },
};
