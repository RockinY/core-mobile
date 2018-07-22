// @flow
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import userInfoFragment from '../../fragments/user/userInfo'
import type { UserInfoType } from '../../fragments/user/userInfo'
import type { FileUpload } from '../../../flowTypes'

export type EditUserInput = {
  input: {
    file?: FileUpload,
    name?: string,
    description?: string,
    website?: string,
    coverFile?: FileUpload,
    username?: string,
    timezone?: number
  }
}

export type EditUserType = {
  ...$Exact<UserInfoType>,
};

export type EditUserProps = {
  editUser: (
    input: $PropertyType<EditUserInput, 'input'>
  ) => Promise<EditUserType>,
};

export const editUserMutation = gql`
  mutation editUser($input: EditUserInput!) {
    editUser(input: $input) {
      ...userInfo
    }
  }
  ${userInfoFragment}
`

const editUserOptions = {
  props: ({ mutate }) => ({
    editUser: input =>
      mutate({
        variables: {
          input
        }
      })
  })
}

export default graphql(editUserMutation, editUserOptions)
