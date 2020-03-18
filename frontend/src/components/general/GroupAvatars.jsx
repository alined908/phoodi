import React from 'react';
import {Avatar, Tooltip, makeStyles} from '@material-ui/core'
import AvatarGroup from '@material-ui/lab/AvatarGroup';

const useStyles = makeStyles(theme => ({
    small: {
      width: theme.spacing(3),
      height: theme.spacing(3),
      marginLeft: "-14px",
      border: "1px solid #fafafa",
      fontSize: ".75rem"
    }
  }));

const GroupAvatars = (props) => {
    const members = props.members;
    const upToThree = members.slice(0, 3)
    const classes = useStyles();

    return (
        <AvatarGroup>
            {upToThree.map((member) => 
                <Tooltip title={member.first_name}>
                    <Avatar className={classes.small} src={member.avatar}>
                        {member.first_name.charAt(0)}
                        {member.last_name.charAt(0)}
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

export default GroupAvatars