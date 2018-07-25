// @flow
import React from 'react';
import { connect } from 'react-redux';
import { AuthSession, SecureStore } from 'expo';
import { authenticate } from '../../actions/authentication';
import type { Dispatch } from 'redux';
import {
  Container,
  GithubButton,
  CodeOfConduct,
  Link,
} from './style';
import { ViewTitle, ViewSubtitle } from '../UserOnboarding/style';
import { REACT_APP_SERVER_URL } from '../../constants'

const API_URL = REACT_APP_SERVER_URL

type Provider = 'github';

type Props = {
  dispatch: Dispatch<Object>,
};

class Login extends React.Component<Props> {
  authenticate = (provider: Provider) => async () => {
    const redirectUrl = AuthSession.getRedirectUrl();
    const result = await AuthSession.startAsync({
      authUrl: `${API_URL}/auth/${provider}?r=${redirectUrl}&authType=token`,
    });
    if (result.type === 'success') {
      const { params } = result;
      this.props.dispatch(authenticate(params.accessToken));
      await SecureStore.setItemAsync('token', params.accessToken);
    }
    if (result.type === 'error') {
      // Some error happened
      // TODO: Error UI
    }
    // User cancelled the login request
    // TODO: Cancel UI
  };

  render() {
    return (
      <Container testID="login">
        <ViewTitle>登陆</ViewTitle>
        <ViewSubtitle>
          云社， 一个自由开放的新一代互联网社区. 
        </ViewSubtitle>
        <GithubButton onPress={this.authenticate('github')} />
        <CodeOfConduct>使用云社表示你同意</CodeOfConduct>
        <Link href="https://github.com/withspectrum/code-of-conduct">
          使用条款
        </Link>
      </Container>
    );
  }
}

export default connect()(Login);
