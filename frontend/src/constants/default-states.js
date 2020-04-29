export const userDefaultState = {
    loginErrorMessage: '',
    signUpErrorMessage: '',
    friends: [],
    isFriendsInitialized: false,
    invites: {
        meetups: [], 
        friends: [], 
        isMeetupInvitesInitialized: false, 
        isFriendInvitesInitialized: false
    },
    preferences: []
}

export const inviteType = {
    friend: 0,
    meetup: 1
}

export const inviteStatus = {
    1: "OPEN",
    2: "ACCEPTED",
    3: "REJECTED"
}

export const roomType = {
    friend: 2,
    meetup: 1
}

export const voteStatus = {
    like: 1,
    dislike: 2,
    ban: 3
}