import PropTypes from 'prop-types';

export let userPropType = PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    avatar: PropTypes.string
})

export let notifsPropType = PropTypes.shape({
    chat_message: PropTypes.number,
    friend_inv: PropTypes.number,
    meetup_inv: PropTypes.number,
    meetup: PropTypes.number,
    friend: PropTypes.number,
})

export let categoryPropType = PropTypes.shape({
    id: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    api_label: PropTypes.string.isRequired
})

export let friendPropType = PropTypes.shape({
    id: PropTypes.number.isRequired,
    user: userPropType,
    created_at: PropTypes.string.isRequired,
    chat_room: PropTypes.string.isRequired
})

export let preferencePropType = PropTypes.shape({
    id: PropTypes.number.isRequired,
    user: userPropType,
    category: categoryPropType,
    name: PropTypes.string.isRequired,
    ranking: PropTypes.number.isRequired,
    timestamp: PropTypes.string.isRequired
})

export let meetupEventOptionPropType = PropTypes.shape({
    id: PropTypes.number.isRequired,
    score: PropTypes.number.isRequired,
    option: PropTypes.string.isRequired,
    votes: PropTypes.object.isRequired,
    banned: PropTypes.bool.isRequired
})

export let meetupEventPropType = PropTypes.shape({
    id: PropTypes.number.isRequired,
    meetup: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    start: PropTypes.string.isRequired,
    end: PropTypes.string.isRequired,
    chosen: PropTypes.number,
    categories: PropTypes.arrayOf(categoryPropType),
    options: PropTypes.objectOf(meetupEventOptionPropType), 
    price: PropTypes.string.isRequired,
    distance: PropTypes.number.isRequired,
    entries: PropTypes.object.isRequired,
    random: PropTypes.bool.isRequired
})

export let meetupMemberPropType = PropTypes.shape({
    user: userPropType,
    ban: PropTypes.bool.isRequired,
    admin: PropTypes.bool.isRequired
})



export let meetupPropType = PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    uri: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    members: PropTypes.objectOf(meetupMemberPropType),
    notifs: PropTypes.number.isRequired,
    categories: PropTypes.arrayOf(categoryPropType),
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    events: PropTypes.objectOf(meetupEventPropType),
})

export let invitePropType = PropTypes.shape({
    id: PropTypes.number.isRequired,
    timestamp: PropTypes.string.isRequired,
    status: PropTypes.number.isRequired,
    uri: PropTypes.string.isRequired,
    sender: userPropType,
    receiver: userPropType,
    meetup: meetupPropType
})

export let chatMessagePropType = PropTypes.shape({
    id: PropTypes.number.isRequired,
    message: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    room_id: PropTypes.number.isRequired,
    sender: userPropType,
    is_notif: PropTypes.bool.isRequired
})

export let chatMemberPropType = PropTypes.objectOf(
    userPropType
)

export let chatRoomPropType = PropTypes.shape({
    id: PropTypes.number.isRequired,
    uri: PropTypes.string.isRequired,
    name: PropTypes.string,
    timestamp: PropTypes.string.isRequired,
    members: PropTypes.object.isRequired,
    friend: PropTypes.number,
    meetup: PropTypes.number,
    notifs: PropTypes.number
}).isRequired