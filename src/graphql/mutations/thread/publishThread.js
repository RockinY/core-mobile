// @flow
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import threadInfoFragment from '../../fragments/thread/threadInfo'
import type { ThreadInfoType } from '../../fragments/thread/threadInfo'

type Attachment = {
  attachmentType: string,
  data: string,
}

export type PublishThreadInput = {
  thread: {
    channelId: string,
    communityId: string,
    type: 'SLATE' | 'DRAFTJS' | 'TEXT',
    content: {
      title: string,
      body?: string,
    },
    attachments?: ?Array<Attachment>,
    filesToUpload?: ?Array<File>,
  },
};

export type PublishThreadResultType = {
  data: {
    publishThread?: {
      ...$Exact<ThreadInfoType>,
      channel: {
        id: string,
        slug: string,
        community: {
          id: string,
          slug: string,
        },
      },
    },
  },
};

export type PublishThreadProps = {
  publishThread: (
    thread: $PropertyType<PublishThreadInput, 'thread'>
  ) => Promise<PublishThreadResultType>,
};

export const publishThreadMutation = gql`
  mutation publishThread($thread: ThreadInput!) {
    publishThread(thread: $thread) {
      ...threadInfo
      channel {
        id
        slug
        community {
          id
          slug
        }
      }
    }
  }
  ${threadInfoFragment}
`

const publishThreadOptions = {
  props: ({ mutate }) => ({
    publishThread: (thread: $PropertyType<PublishThreadInput, 'thread'>) =>
      mutate({
        variables: {
          thread
        }
      })
  })
}

export default graphql(publishThreadMutation, publishThreadOptions)
