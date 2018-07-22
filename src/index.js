// @flow
import 'dotenv/config'
import 'string.fromcodepoint';
import React, { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'react-native'
import { SecureStore, AppLoading } from 'expo'
import { Provider } from 'react-redux'
import { ApolloProvider, Query } from 'react-apollo'
import { ThemeProvider } from 'styled-components'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { type ApolloClient } from 'apollo-client'
import { initStore } from './reducers/store'
import Toasts from './components/Toasts'
import theme from './components/theme'
import { createClient } from './graphql'
import Login from './views/Login'
import TabBar from './views/TabBar/App'
import { SetUsername, ExploreCommunities } from './views/UserOnboarding'
import { authenticate } from './actions/authentication'
import { getCurrentUserCommunityConnectionQuery } from './graphql/queries/user/getUserCommunityConnection'

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
