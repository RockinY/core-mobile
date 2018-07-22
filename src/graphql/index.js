// @flow
import { ApolloClient } from 'apollo-client'
import { createUploadLink } from 'apollo-upload-client'
import { RetryLink } from 'apollo-link-retry'
import {
  InMemoryCache,
  IntrospectionFragmentMatcher
} from 'apollo-cache-inmemory'
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import introspectionQueryResultData from './schema.json'
import getSharedApolloClientOptions from './apolloClientOptions'
import { REACT_APP_WS_URI, REACT_APP_API_URI } from '../constants'

// Fixes a bug with ReactNative, see https://github.com/facebook/react-native/issues/9599
if (typeof global.self === 'undefined') {
  global.self = global
}

type CreateClientOptions = {
  token?: ?string
}

export const wsLink = new WebSocketLink({
  uri: REACT_APP_WS_URI,
  options: {
    reconnect: true,
  }
})

export const createClient = (options?: CreateClientOptions = {}) => {
  const cache = new InMemoryCache({
    fragmentMatcher: new IntrospectionFragmentMatcher({
      introspectionQueryResultData
    }),
    ...getSharedApolloClientOptions()
  })

  const headers = options.token ? { authorization: `Bearer ${options.token}` } : undefined

  const retryLink = new RetryLink({
    attempts: (count, operation, error) => {
      const isMutation =
        operation &&
        operation.query &&
        operation.query.definitions &&
        Array.isArray(operation.query.definitions) &&
        operation.query.definitions.some(def => {
          return def.kind === 'OperationDefinition' && def.operation === 'mutation'
        })

      if (isMutation) {
        return !!error && count < 25
      }

      return !!error && count < 6
    }
  })

  const httpLink = retryLink.concat(
    createUploadLink({
      uri: REACT_APP_API_URI,
      credentials: 'include',
      headers
    })
  )

  const link = split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query)
      return kind === 'OperationDefinition' && operation === 'subscription'
    },
    wsLink,
    httpLink
  )

  return new ApolloClient({
    link,
    cache: window.__DATA__ ? cache.restore(window.__DATA__) : cache,
    ssrForceFetchDelay: 100,
    queryDuplication: true
  })
}

const client = createClient()

export { client }

export const clearApolloStore = () => {
  try {
    client.resetStore()
  } catch (e) {
    console.error('error clearing store')
  }
}
