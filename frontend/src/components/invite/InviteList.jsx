import React, { Component } from "react"
import {sendMeetupInvite, sendFriendInvite, respondFriendInvite, respondMeetupInvite} from "../../actions/invite"
import {connect} from 'react-redux';
import {inviteType, inviteStatus} from "../../constants/default-states"
import {Button, Menu, MenuItem} from "@material-ui/core"; 
import MenuPopper from "./MenuPopper"

class InviteList extends Component {

    render () {
        // const renderFriendInviteList = (invites) => {
        //     return (
        //         <>
        //             {invites.map((inv) =>
        //                 <div>
        //                     <div>{inv.sender.first_name} </div>
        //                     {inviteStatus[inv.status] === "OPEN" && 
        //                         <div>
        //                             <span>Accept</span>
        //                             <span>Reject</span>
        //                         </div>
        //                     }
        //                 </div>
        //             )}
        //         </>
        //     )
            
        // }

        // const renderMeetupInviteList = (invites) => {
        //     return (
        //         <>
        //             {invites.map((inv) => 
        //                 <div>
        //                     <div>{inv.sender.first_name} - Meetup</div>
        //                     {inviteStatus[inv.status] === "OPEN" && 
        //                         <div>
        //                             <span>Accept</span>
        //                             <span>Reject</span>
        //                         </div>
        //                     }
        //                 </div>
        //             )}
        //         </>
        //     )
        // }

        return (
            <>
                {/* {this.props.type === inviteType.friend && renderFriendInviteList(this.props.invites)}
                {this.props.type === inviteType.meetup && renderMeetupInviteList(this.props.invites)} */}
                {<MenuPopper type={this.props.type} invites={this.props.invites}></MenuPopper>}
            </>
        )
    }
}
function mapStateToProps(state) {
    return {

    }
}

const mapDispatchToProps = {
    sendMeetupInvite,
    respondMeetupInvite,
    sendFriendInvite,
    respondFriendInvite
}

export default connect(mapStateToProps, mapDispatchToProps)(InviteList)