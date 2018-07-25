// @flow
import 'string.fromcodepoint';
import React, { Fragment } from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import { SecureStore, AppLoading } from 'expo'
import { Provider } from 'react-redux'
import { ApolloProvider, Query } from 'react-apollo'
import { ThemeProvider } from 'styled-components'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { type ApolloClient } from 'apollo-client'
import { initStore } from './src/reducers/store'
import Toasts from './src/components/Toasts'
import theme from './src/components/theme'
import { createClient } from './src/graphql'
import Login from './src/views/Login'
import TabBar from './src/views/TabBar/App'
import { SetUsername, ExploreCommunities } from './src/views/UserOnboarding'
import { authenticate } from './src/actions/authentication'
import { getCurrentUserCommunityConnectionQuery } from './src/graphql/queries/user/getUserCommunityConnection'

const store = initStore()

type State = {
  authLoaded: ?boolean,
  token: ?string,
  client: ApolloClient
}

class App extends React.Component<{}, State> {
  state = {
    authLoaded: null,
    token: null,
    client: createClient()
  }

  componentDidMount = async () => {
    store.subscribe(this.listen)

    let token
    try {
      token = await SecureStore.getItemAsync('token')
    } catch (err) {
      this.setState({
        authLoaded: true
      })
    }

    if (token) {
      store.dispatch(authenticate(token))
    }

    this.setState({
      authLoaded: true,
      token
    })
  }

  listen = () => {
    const storeState = store.getState()
    const authentication = storeState && storeState.authentication
    const { token: oldToken } = this.state
    if (authentication.token !== oldToken) {
      this.setState({
        token: authentication.token,
        client: createClient({
          token: authentication.token
        })
      })
    }
  }

  render () {
    if (!this.state.authLoaded) {
      // $FlowFixMe
      return <AppLoading />
    }

    const { client, token } = this.state

    return (
      <Provider store={store}>
        <ApolloProvider client={client}>
          <ThemeProvider theme={theme}>
            <ActionSheetProvider>
              <Fragment>
                <StatusBar barStyle={'default'} />
                <Toasts />
                {!token ? (
                  <Login />
                ) : (
                  <Query query={getCurrentUserCommunityConnectionQuery}>
                    {({data: { user }, networkStatus, refetch}) => {
                      if (networkStatus === 1 || networkStatus === 2) {
                        return null
                      }
                      if (!user) {
                        return <Login />
                      }
                      if (!user.username) {
                        return <SetUsername />
                      }
                      if (user.communityConnection.edges.length === 0) {
                        return <ExploreCommunities refetch={refetch} />
                      }
                      return <TabBar />
                    }}
                  </Query>
                )}
              </Fragment>
            </ActionSheetProvider>
          </ThemeProvider>
        </ApolloProvider>
      </Provider>
    )
  }
}

export default App
