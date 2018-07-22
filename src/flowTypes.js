// @flow
/* ----------- Database ----------- */
export type DBUser = {
  id: string,
  email?: string,
  createdAt: Date,
  name: string,
  coverPhoto: string,
  profilePhoto: string,
  providerId?: ?string,
  githubProviderId?: ?string,
  githubUsername?: ?string,
  username: ?string,
  timezone?: ?number,
  isOnline?: boolean,
  lastSeen?: ?Date,
  description?: ?string,
  website?: ?string,
  modifiedAt: ?Date,
  bannedAt: ?Date
}

export type DBCommunity = {
  coverPhoto: string,
  createdAt: Date,
  description: string,
  id: string,
  name: string,
  profilePhoto: string,
  slug: string,
  website?: ?string,
  deletedAt?: Date,
  pinnedThreadId?: string,
  watercoolerId?: string,
  creatorId: string,
  administratorEmail: ?string,
  hasAnalytics: boolean,
  hasPrioritySupport: boolean,
  stripeCustomerId: ?string,
  pendingAdministratorEmail?: string,
  ossVerified?: boolean,
  isPrivate: boolean
}

export type DBChannel = {
  communityId: string,
  createdAt: Date,
  deletedAt?: Date,
  description: string,
  id: string,
  isDefault: boolean,
  isPrivate: boolean,
  name: string,
  slug: string,
  archivedAt?: Date
}

type DBThreadAttachment = {
  attachmentType: 'photoPreview',
  data: {
    name: string,
    type: string,
    url: string
  }
}

type DBThreadEdits = {
  attachments?: {
    photos: Array<DBThreadAttachment>
  },
  content: {
    body?: any,
    title: string
  },
  timestamp: Date
}

export type DBThread = {
  id: string,
  channelId: string,
  communityId: string,
  content: {
    body?: any,
    title: string
  },
  createdAt: Date,
  creatorId: string,
  isPublished: boolean,
  isLocked: boolean,
  lockedBy?: string,
  lockedAt?: Date,
  lastActive: Date,
  modifiedAt?: Date,
  deletedAt?: string,
  deletedBy: ?string,
  attachments?: Array<DBThreadAttachment>,
  edits?: Array<DBThreadEdits>,
  watercooler?: boolean,
  type: string
}

export type DBUsersChannels = {
  id: string,
  channelId: string,
  createdAt: Date,
  isBlocked: boolean,
  isMember: boolean,
  isModerator: boolean,
  isOwner: boolean,
  isPending: boolean,
  receiveNotifications: boolean,
  userId: string
}

export type DBMessage = {
  content: {
    body: string
  },
  id: string,
  messageType: 'text' | 'media' | 'draftjs',
  senderId: string,
  deletedAt?: Date,
  deletedBy?: string,
  threadId: string,
  threadType: 'story' | 'directMessageThread',
  timestamp: Date,
  parentId?: string
}

export type DBDirectMessageThread = {
  createdAt: Date,
  id: string,
  name?: string,
  threadLastActive: Date
}

type ReactionType = 'like'
export type DBReaction = {
  id: string,
  messageId: string,
  timestamp: Date,
  type: ReactionType,
  userId: string
}

export type NotificationPayloadType =
  | 'REACTION'
  | 'THREAD_REACTION'
  | 'MESSAGE'
  | 'THREAD'
  | 'CHANNEL'
  | 'COMMUNITY'
  | 'USER'
  | 'DIRECT_MESSAGE_THREAD'

export type NotificationEventType =
  | 'REACTION_CREATED'
  | 'MESSAGE_CREATED'
  | 'THREAD_CREATED'
  | 'THREAD_EDITED'
  | 'CHANNEL_CREATED'
  | 'DIRECT_MESSAGE_THREAD_CREATED'
  | 'USER_JOINED_COMMUNITY'
  | 'USER_REQUESTED_TO_JOIN_PRIVATE_CHANNEL'
  | 'USER_APPROVED_TO_JOIN_PRIVATE_CHANNEL'
  | 'THREAD_LOCKED_BY_OWNER'
  | 'THREAD_DELETED_BY_OWNER'
  | 'COMMUNITY_INVITATION'

type NotificationPayload = {
  id: string,
  payload: string,
  type: NotificationPayloadType
}

export type DBNotification = {
  id: string,
  actors: Array<NotificationPayload>,
  context: NotificationPayload,
  createdAt: Date,
  entities: Array<NotificationPayload>,
  event: NotificationEventType,
  modifiedAt: Date
}

export type DBUsersNotifications = {
  id: string,
  createdAt: Date,
  entityAddedAt: Date,
  isRead: boolean,
  isSeen: boolean,
  notificationId: string,
  userId: string
}

export type DBNotificationsJoin = {
  ...$Exact<DBUsersNotifications>,
  ...$Exact<DBNotification>
}

export type DBUsersThreads = {
  id: string,
  createdAt: Date,
  isParticipant: boolean,
  receiveNotifications: boolean,
  threadId: string,
  userId: string,
  lastSeen?: Date | number
}

export type DBChannelSettings = {
  id: string,
  channelId: string,
  joinSettings?: {
    tokenJoinEnabled: boolean,
    token: string,
  },
  slackSettings?: {
    botLinks: {
      threadCreated: ?string,
    },
  }
}

export type DBCommunitySettings = {
  id: string,
  communityId: string,
  brandedLogin: ?{
    customMessage: ?string,
  },
  slackSettings: ?{
    connectedAt: ?string,
    connectedBy: ?string,
    invitesSentAt: ?string,
    teamName: ?string,
    teamId: ?string,
    scope: ?string,
    token: ?string,
    invitesMemberCount: ?string,
    invitesCustomMessage: ?string,
  },
  joinSettings: {
    tokenJoinEnabled: boolean,
    token: ?string,
  }
}

export type DBUsersCommunities = {
  id: string,
  communityId: string,
  createdAt: Date,
  isBlocked: boolean,
  isMember: boolean,
  isModerator: boolean,
  isOwner: boolean,
  isPending: boolean,
  receiveNotifications: boolean,
  reputation: number,
  userId: string,
}

/* ----------- Loader ----------- */
export type Loader = {
  load: (key: string | Array<string>) => Promise<any>,
  loadMany: (keys: Array<string>) => Promise<any>,
  clear: (key: string | Array<string>) => void
}

export type DataLoaderOptions = {
  cache?: boolean
}

/* ----------- GraphQL ----------- */
export type GraphQLContext = {
  user: DBUser,
  loaders: {
    [key: string]: Loader
  }
}

/* ----------- General ----------- */
export type FileUpload = {
  filename: string,
  mimetype: string,
  encoding: string,
  stream: any
}

export type EntityTypes = 'communities' | 'channels' | 'users' | 'threads'
