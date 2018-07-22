// @flow
import React, { Component } from 'react';
import { View } from 'react-native';
import compose from 'recompose/compose';
import ChatInput from '../../components/ChatInput';
import Messages from '../../components/Messages';
import ViewNetworkHandler, {
  type ViewNetworkHandlerProps,
} from '../../components/ViewNetworkHandler';
import Loading from '../../components/Loading';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Wrapper } from './style';
import sentencify from '../../utils/sentencify';
import getDirectMessageThread, {
  type GetDirectMessageThreadType,
} from '../../graphql/queries/directMessageThread/getDirectMessageThread';
import getDirectMessageThreadMessageConnection from '../../graphql/queries/directMessageThread/getDirectMessageThreadMessageConnection';
import type { GetUserType } from '../../graphql/queries/user/getUser';
import sendDirectMessage from '../../graphql/mutations/message/sendDirectMessage';
import type { NavigationProps } from 'react-navigation';
import { FullscreenNullState } from '../../components/NullStates';
import { withCurrentUser } from '../../components/WithCurrentUser';
import withSafeAreaView from '../../components/SafeAreaView';

const DirectMessageThreadMessages = getDirectMessageThreadMessageConnection(
  Messages
);

type Props = {
  ...$Exact<ViewNetworkHandlerProps>,
  id: string,
  sendDirectMessage: Function,
  currentUser: GetUserType,
  navigation: NavigationProps,
  data: {
    directMessageThread?: GetDirectMessageThreadType,
  },
};

class DirectMessageThread extends Component<Props> {
  setTitle = () => {
    const {
      data: { directMessageThread },
      navigation,
      currentUser,
    } = this.props;
    let title = directMessageThread
      ? sentencify(
          directMessageThread.participants
            .filter(user => user.userId !== currentUser.id)
            .map(({ name }) => name)
        )
      : 'Loading thread...';
    const oldTitle = navigation.getParam('title', null);
    if (oldTitle && oldTitle === title) return;
    navigation.setParams({ title });
  };

  componentDidMount() {
    this.setTitle();
  }

  componentDidUpdate(prev) {
    this.setTitle();
  }

  sendMessage = text => {
    if (!this.props.data.directMessageThread) return;
    this.props.sendDirectMessage({
      threadId: this.props.data.directMessageThread.id,
      threadType: 'directMessageThread',
      messageType: 'text',
      content: {
        body: text,
      },
    });
  };

  render() {
    const {
      isLoading,
      hasError,
      data: { directMessageThread },
      navigation,
    } = this.props;

    if (directMessageThread) {
      return (
        <Wrapper>
          <ErrorBoundary alert>
            <View style={{ flex: 1 }}>
              <DirectMessageThreadMessages
                navigation={navigation}
                id={directMessageThread.id}
                inverted={true}
              />

              <ErrorBoundary>
                <ChatInput onSubmit={this.sendMessage} />
              </ErrorBoundary>
            </View>
          </ErrorBoundary>
        </Wrapper>
      );
    }

    if (isLoading) return <Loading />;
    if (hasError) return <FullscreenNullState />;

    return null;
  }
}

export default compose(
  withCurrentUser,
  sendDirectMessage,
  getDirectMessageThread,
  ViewNetworkHandler,
  withSafeAreaView
)(DirectMessageThread);
