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
      body2: { ...bold, fontSize: ".75rem" },
      button: { ...bold, fontSize: ".75rem" },
    },
    palette: {
      primary : {
          main: "rgb(0,0,0,.9)"
      },
      secondary : {
          main: "#ff4949"
      },
    },
    overrides: {
      MuiButton: {
        root: {
          padding: "6px 10px",
          textTransform: "none",
          fontSize: ".8rem",
          fontFamily: "Roboto",
          minWidth: '55px'
        },
        sizeSmall: {
          fontSize: ".7rem",
          padding: "4px 6px"
        },
        containedSecondary:{
          backgroundColor: "var(--secondary)",
          boxShadow: "var(--secondary-shadow)",
          '&:hover': {
            backgroundColor: "var(--secondary-hover-background)",
          }
        }
      },
      MuiFab : {
          root: {
              background: "rgba(10,10,10, .95)",
              color: "white",
              '&:hover': {
                  background: "black"
              }
          },
          secondary: {
            backgroundColor: "var(--secondary)",
            boxShadow: "var(--secondary-shadow-circular)",
            transition: "all .2s ease",
            '&:hover': {
              backgroundColor: "var(--secondary-hover-background)",

              transform: "scale(1.05)"
            }
          },
          extended: {
              width: "100%"
          }
      },
      MuiAvatar: {
        root: {
          fontFamily: "Lato",
          fontSize: "1.15rem",
          marginRight: 5
        },
        square :{
            boxShadow: "none"
        }
      },
      MuiInputLabel:{
          root: {
              fontWeight: '600',
              fontSize: ".8rem"
          }
      },
      MuiList:{
        padding: {
            paddingTop: 0,
            paddingBottom: 0
        }
      },
      MuiListItem  : {
          root: {
              minWidth: 35
          }
      },
      MuiListItemText : {
        multiline: {
            marginTop: 4,
            marginBottom: 4,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis"
        }
      },
      MuiListItemIcon : {
        root: {
          minWidth: '40px'
        }
      },
      MuiListItemAvatar:{
        root: {
            minWidth: 30
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
      MuiRating: {
          icon: {
            filter:  "drop-shadow( 1px 1px 1px rgba(0, 0, 0, .5))"
          }
      },
      MuiChip: {
        root: {
          padding: "3px 4px",
          fontSize: ".7rem",
          borderRadius: "4px",
          border: "1px solid #eeeeef",
          backgroundColor: "var(--background)",
          color: "black",
          margin: ".25rem",
          letterSpacing: "0.02857em",
          textTransform: "capitalize",
          boxShadow:"var(--shadow-0)"
        },
      },
      MuiFilledInput : {
          root: {
              backgroundColor: "var(--bg-grey)",
              border: "var(--border-separator)",
              '&:hover': {
                backgroundColor: "white"
              },
              '&.Mui-focused':{
                background: "white"
              },
              borderRadius: "4px !important",
              '&.Mui-disabled':{
                backgroundColor: "var(--bg-grey)",
                cursor: "pointer",
                '&:hover': {
                  backgroundColor: "white"
                },
              },
          }
      },
      MuiFormHelperText:{
        root: {
            fontWeight: 600,
            fontSize: ".7rem",
            marginTop: '0 !important'
        },
        contained: {
            marginLeft: 10
        }
      },
      MuiSlider : {
          root: {
              color: "var(--background)"
          },
          thumb: {
              color: "#99c4ff",
  
          }
      },
      MuiListItem : {
          root: {
              '&$selected' : {
                  backgroundColor: "var(--light-blue)",
                  boxShadow: "var(--shadow-0)",
                  '&:hover': {
                      backgroundColor: "var(--light-blue)"
                  }
              }
          }
      },
      MuiBottomNavigation : {
          root :{
              justifyContent: "space-evenly",
              height: 50,
              position: 'fixed',
              bottom: 0,
              width: "100%",
              borderTop: "var(--border-separator)",
              boxShadow: 'var(--shadow-1)'
          }
      },
      MuiBottomNavigationAction : {
          root : {
              fontFamily: "Lato",
              fontWeight: 600,
              '&$selected' : {
                  color: "var(--bright-blue)"
              },
              padding: "6px"
          },
          label : {
              '&$selected' : {
                  color: "black",
                  fontSize: ".75rem"
              }
          }
      },
      MuiGrid: {
          item: {
              height: "100%;"
          }
      },
      MuiFormControl: {
          root: {
              width: "100%"
          }
      },
      MuiFormControlLabel:{
        label:{
            fontSize: ".75rem"
        }
      },
      MuiSelect : {
          selectMenu: {
              display: "flex",
              alignItems: "center"
          }
      },
      MuiToolbar: {
        dense: {
            minHeight: 55
        }
      },
      MuiPopover: {
          paper: {
              minWidth: 200
          }
      },
      MuiCardHeader:{
        root:{
          padding: "10px 15px"
        },
        avatar:{
          marginRight: 10
        },
        title: {
          fontSize: '.85rem'
        },
        action: {
          alignSelf: 'none',
          marginTop: 0,
          marginRight: 0
        }
      },
      MuiCardActions: {
        root:{
          padding: "0 8px"
        }
      }
    },
  };