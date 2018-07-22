// @flow
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

export const deleteCurrentUserMutation = gql`
  mutation deleteCurrentUser {
    deleteCurrentUser
  }
`

const deleteCurrentUserOptions = {
  props: ({ mutate }) => ({
    // $FlowFixMe
    deleteCurrentUser: () => mutate()
  })
}

export default graphql(deleteCurrentUserMutation, deleteCurrentUserOptions)
