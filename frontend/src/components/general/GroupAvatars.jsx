import React from 'react';
import {Avatar, Tooltip, makeStyles, Badge} from '@material-ui/core'
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import {connect} from 'react-redux'


const useStyles = makeStyles(theme => ({
    small: {
      width: theme.spacing(3),
      height: theme.spacing(3),
      marginLeft: "-14px",
      border: "1px solid #fafafa",
      fontSize: ".75rem"
    },
    badge: {
        backgroundColor: 'inherit',
        border: "0",
    }
  }));

const GroupAvatars = (props) => {
    const classes = useStyles();
    const members = props.members;
    const user = JSON.stringify(props.user)
    var userInMembers = false;

    for (var i = 0; i < members.length; i++){
        if (JSON.stringify(members[i]) === user){
            userInMembers = true
            var b = members[i]
            members[i] = members[0]
            members[0] = b
            break;
        }
    }
    const upToThree = members.slice(0, 3)

    return (
        <AvatarGroup>
            {upToThree.map((member, index) => 
                (userInMembers && index === 0) ?
                    <Badge  
                        color="primary"
                        overlap="circle" 
                        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}} 
                        variant="dot"
                        style={{border: 0, marginLeft: "0"}}
                    >
                        <Tooltip key={index} title={member.first_name}>
                            <Avatar className={classes.small} src={member.avatar}>
                                {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                            </Avatar>
                        </Tooltip>
                    </Badge>
                :
                <Tooltip key={index} title={member.first_name}>
                    <Avatar className={classes.small} src={member.avatar}>
                        {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                    </Avatar>
                </Tooltip>
            )}
            {members.length > 3 && 
                <Avatar className={classes.small}>
                    +{members.length - 3}
                </Avatar>
            }
        </AvatarGroup>
    )
}

function mapStateToProps(state){
    return {
        user: state.user.user
    }
}

export default connect(mapStateToProps)(GroupAvatars)