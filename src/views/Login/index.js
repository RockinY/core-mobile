// @flow
import React from 'react';
import { connect } from 'react-redux';
import { AuthSession, SecureStore } from 'expo';
import { authenticate } from '../../actions/authentication';
import type { Dispatch } from 'redux';
import {
  Container,
  FacebookButton,
  GithubButton,
  GoogleButton,
  TwitterButton,
  CodeOfConduct,
  Link,
} from './style';
import { ViewTitle, ViewSubtitle } from '../UserOnboarding/style';

const API_URL = process.env.REACT_APP_SERVER_URL

type Provider = 'twitter' | 'facebook' | 'google' | 'github';

type Props = {
  dispatch: Dispatch<Object>,
};

class Login extends React.Component<Props> {
  authenticate = (provider: Provider) => async () => {
    const redirectUrl = AuthSession.getRedirectUrl();
    const result = await AuthSession.startAsync({
      // $FlowFixMe
      authUrl: `${API_URL}/auth/${provider}?r=${redirectUrl}&authType=token`,
    });
    if (result.type === 'success') {
      const { params } = result;
      this.props.dispatch(authenticate(params.accessToken));
      await SecureStore.setItemAsync('token', params.accessToken);
    }
    if (result.type === 'error') {
      // Some error happened
      // TODO(@mxstbr): Error UI
    }
    // User cancelled the login request
    // TODO(@mxstbr): Cancel UI
  };

  render() {
    return (
      <Container testID="login">
        <ViewTitle>Sign in to get started</ViewTitle>
        <ViewSubtitle>
          Spectrum is a place where communities can share, discuss, and grow
          together. Sign in below to join the conversation.
        </ViewSubtitle>
        <TwitterButton onPress={this.authenticate('twitter')} />
        <GoogleButton onPress={this.authenticate('google')} />
        <FacebookButton onPress={this.authenticate('facebook')} />
        <GithubButton onPress={this.authenticate('github')} />
        <CodeOfConduct>By using Spectrum, you agree to our</CodeOfConduct>
        <Link href="https://github.com/withspectrum/code-of-conduct">
          Code of Conduct
        </Link>
      </Container>
    );
  }
}

export default connect()(Login);
