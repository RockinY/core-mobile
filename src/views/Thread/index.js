// @flow
import * as React from 'react';
// $FlowFixMe
import type { ScrollViewProps } from 'react-native';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { getThreadById } from '../../graphql/queries/thread/getThread';
import ViewNetworkHandler from '../../components/ViewNetworkHandler';
import withSafeView from '../../components/SafeAreaView';
import ThreadContent from '../../components/ThreadContent';
import Messages from '../../components/Messages';
import ChatInput from '../../components/ChatInput';
import getThreadMessageConnection from '../../graphql/queries/thread/getThreadMessageConnection';
import sendMessageMutation from '../../graphql/mutations/message/sendMessage';
import { convertTimestampToDate } from '../../utils/timeFormatting';
import { withCurrentUser } from '../../components/WithCurrentUser';
import type { GetThreadType } from '../../graphql/queries/thread/getThread';
import type { GetUserType } from '../../graphql/queries/user/getUser';
import type { NavigationProps } from 'react-navigation';
import Loading from '../../components/Loading';
import ErrorBoundary from '../../components/ErrorBoundary';
import { FullscreenNullState } from '../../components/NullStates';
import { UserListItem } from '../../components/Lists';
import {
  ThreadContentContainer,
  ThreadTitle,
  ThreadTimestamp,
  Wrapper,
  ThreadScrollView,
} from './style';

const ThreadMessages = getThreadMessageConnection(Messages);

type Props = {
  isLoading: boolean,
  hasError: boolean,
  sendMessage: Function,
  quotedMessage: ?string,
  currentUser: GetUserType,
  navigation: NavigationProps,
  data: {
    thread?: GetThreadType,
  },
};

class Thread extends React.Component<Props> {
  scrolledToBottomOnMount: boolean;
  scrollView: ScrollViewProps;

  constructor() {
    super();

    this.scrolledToBottomOnMount = false;
  }

  setTitle = () => {
    const { data: { thread }, navigation } = this.props;
    let title;
    if (thread) {
      title = thread.content.title;
    } else {
      title = 'Loading thread...';
    }
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

  messagesDidLoad = () => {
    if (
      !this.scrolledToBottomOnMount &&
      this.props.data.thread &&
      this.props.data.thread.currentUserLastSeen
    ) {
      this.scrolledToBottomOnMount = true;
      this.scrollView && setTimeout(() => this.scrollView.scrollToEnd());
    }
  };

  sendMessage = (body: string, user: Object) => {
    const { quotedMessage, data: { thread } } = this.props;
    if (!thread) return;
    this.props.sendMessage(
      {
        threadId: thread.id,
        threadType: 'story',
        messageType: 'text',
        parentId: quotedMessage,
        content: {
          body,
        },
      },
      user
    );
  };

  render() {
    const { data, isLoading, hasError, currentUser, navigation } = this.props;

    if (data.thread) {
      const createdAt = new Date(data.thread.createdAt).getTime();
      // NOTE(@mxstbr): For some reason this is necessary to make flow understand that the thread is defined
      // not sure why, but the new Date() call above breaks its inference and it thinks data.thread could be
      // undefined below
      const thread = ((data.thread: any): GetThreadType);

      return (
        <Wrapper>
          <ThreadScrollView
            innerRef={c => (this.scrollView = c)}
            testID="e2e-thread"
          >
            <UserListItem
              onPressHandler={() =>
                navigation.navigate({
                  routeName: 'User',
                  key: thread.author.user.id,
                  params: { id: thread.author.user.id },
                })
              }
              user={thread.author.user}
            />
            <ThreadContentContainer>
              <ThreadTitle>{thread.content.title}</ThreadTitle>

              <ThreadTimestamp>
                {convertTimestampToDate(createdAt)}
              </ThreadTimestamp>

              {Boolean(thread.content.body) && (
                <ThreadContent
                  rawContentState={JSON.parse(thread.content.body)}
                />
              )}
            </ThreadContentContainer>
            <ErrorBoundary>
              <ThreadMessages
                navigation={navigation}
                id={thread.id}
                messagesDidLoad={this.messagesDidLoad}
              />
            </ErrorBoundary>
          </ThreadScrollView>

          {Boolean(currentUser) && (
            <ErrorBoundary>
              <ChatInput
                onSubmit={text => this.sendMessage(text, currentUser)}
              />
            </ErrorBoundary>
          )}
        </Wrapper>
      );
    }

    if (isLoading) {
      return (
        <Wrapper>
          <Loading />
        </Wrapper>
      );
    }

    if (hasError) {
      return <FullscreenNullState />;
    }

    return null;
  }
}

const map = (state, ownProps): * => ({
  quotedMessage:
    ownProps.data.thread && state.message.quotedMessage
      ? state.message.quotedMessage[ownProps.data.thread.id]
      : null,
});

export default compose(
  withSafeView,
  getThreadById,
  connect(map),
  sendMessageMutation,
  withCurrentUser,
  ViewNetworkHandler
)(Thread);
