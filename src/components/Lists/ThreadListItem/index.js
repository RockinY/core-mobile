// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Share } from 'react-native';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import compose from 'recompose/compose';
import { ListItem } from '../ListItem';
import { TextColumnContainer, Title } from '../style';
import { ThreadFacepileRowContainer } from './style';
import type { GetThreadType } from '../../../graphql/queries/thread/getThread';
import ThreadCommunityInfo from './ThreadCommunityInfo';
import PillOrMessageCount from './PillOrMessageCount';
import Facepile from '../../Facepile';
import ErrorBoundary from '../../ErrorBoundary';
import { withNavigation, type NavigationProps } from 'react-navigation';
import type { GetUserType } from '../../../graphql/queries/user/getUser';
import setThreadLockMutation from '../../../graphql/mutations/thread/lockThread';
import toggleThreadNotificationsMutation from '../../../graphql/mutations/thread/toggleThreadNotifications';
import deleteThreadMutation, {
  type DeleteThreadType,
} from '../../../graphql/mutations/thread/deleteThread';
import pinThreadMutation from '../../../graphql/mutations/community/pinCommunityThread';
import triggerDeleteAlert from '../../DeleteAlert';
import { addToast } from '../../../actions/toasts';
import { REACT_APP_CLIENT_URL } from '../../../constants'

type Props = {
  thread: GetThreadType,
  activeChannel?: string,
  activeCommunity?: string,
  onPressHandler: Function,
  currentUser: GetUserType,
  showActionSheetWithOptions: Function,
  navigation: NavigationProps,
  setThreadLock: Function,
  pinThread: Function,
  deleteThread: Function,
  toggleThreadNotifications: Function,
  dispatch: Function,
  // refetches the parent query that resolved this thread - used when
  // a thread is deleted and we want to refetch the parent query, regardless
  // of where that query was called from
  refetch: Function,
};

const CANCEL = '取消';
const SHARE = '分享';
const MESSAGE_AUTHOR = '信息作者';
const PIN_CONVERSATION = '对话置顶';
const UNPIN_CONVERSATION = '对话取消置顶';
const LOCK_CONVERSATION = '锁定对话';
const UNLOCK_CONVERSATION = '取消对话锁定';
const DELETE_CONVERSATION = '删除对话';
const SUBSCRIBE_CONVERSATION = '订阅对话';
const MUTE_CONVERSATION = '对话静音';

class ThreadListItemHandlers extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    const currProps = this.props;
    if (nextProps.thread.id !== currProps.thread.id) return true;
    if (nextProps.thread.lastActive !== currProps.thread.lastActive)
      return true;
    if (nextProps.thread.isLocked !== currProps.thread.isLocked) return true;
    return false;
  }

  shareThread = () => {
    const { thread } = this.props;

    return Share.share(
      {
        url: `${REACT_APP_CLIENT_URL}/thread/${thread.id}`,
        title: `${thread.content.title}`,
      },
      {
        subject: `${thread.content.title}`,
      }
    );
  };

  toggleLockThread = () => {
    const { thread, setThreadLock, dispatch, navigation } = this.props;

    return setThreadLock({
      threadId: thread.id,
      value: !thread.isLocked,
    })
      .then(() => {
        return dispatch(
          addToast({
            type: 'neutral',
            message: thread.isLocked
              ? '对话已解锁'
              : '对话已锁住',
            onPressHandler: () =>
              navigation.navigate({
                routeName: 'Thread',
                key: thread.id,
                params: {
                  id: thread.id,
                },
              }),
            icon: 'checkmark',
          })
        );
      })
      .catch(err => {
        return dispatch(
          addToast({
            type: 'error',
            message: '对话锁定失败',
            onPressHandler: () =>
              navigation.navigate({
                routeName: 'Thread',
                key: thread.id,
                params: {
                  id: thread.id,
                },
              }),
            icon: 'checkmark',
          })
        );
      });
  };

  togglePinThread = () => {
    const { thread, pinThread } = this.props;
    const isPinned = thread.community.pinnedThreadId === thread.id;

    return pinThread({
      threadId: thread.id,
      communityId: thread.community.id,
      value: isPinned ? null : thread.id,
    });
  };

  toggleNotifications = () => {
    const { thread, toggleThreadNotifications } = this.props;

    return toggleThreadNotifications({
      threadId: thread.id,
    });
  };

  getActionSheetOptions = () => {
    const { thread, currentUser } = this.props;
    const {
      channel: { channelPermissions },
      community: { communityPermissions },
    } = thread;

    const isThreadAuthor = currentUser.id === thread.author.user.id;
    const isChannelModerator = channelPermissions.isModerator;
    const isCommunityModerator = communityPermissions.isModerator;
    const isChannelOwner = channelPermissions.isOwner;
    const isCommunityOwner = communityPermissions.isOwner;
    const canModerateGlobally =
      isChannelModerator ||
      isCommunityModerator ||
      isChannelOwner ||
      isCommunityOwner;
    const canModerateCommunity = isCommunityModerator || isCommunityOwner;

    let options, cancelButtonIndex, destructiveButtonIndex;
    options = [SHARE];

    if (thread.author.user.id !== currentUser.id) {
      options = options.concat(MESSAGE_AUTHOR);
    }

    options = options.concat(
      thread.receiveNotifications ? MUTE_CONVERSATION : SUBSCRIBE_CONVERSATION
    );

    if (canModerateCommunity) {
      options = options.concat(
        thread.community.pinnedThreadId === thread.id
          ? UNPIN_CONVERSATION
          : PIN_CONVERSATION
      );
    }

    if (canModerateGlobally) {
      options = options.concat(
        thread.isLocked ? UNLOCK_CONVERSATION : LOCK_CONVERSATION
      );
    }

    if (isThreadAuthor || canModerateGlobally) {
      options = options.concat(DELETE_CONVERSATION);
    }

    options = options.concat(CANCEL);
    cancelButtonIndex = options.length - 1;
    destructiveButtonIndex = options.indexOf(DELETE_CONVERSATION);

    return {
      options,
      cancelButtonIndex,
      destructiveButtonIndex,
    };
  };

  actionSheetEventHandlers = (options, index) => {
    const { navigation, thread, currentUser, deleteThread } = this.props;

    const isAuthor = currentUser.id === thread.author.user.id;

    const action = options[index];
    if (action === SHARE) {
      return this.shareThread();
    }

    if (action === MESSAGE_AUTHOR) {
      return navigation.navigate({
        routeName: 'DirectMessageComposer',
        key: thread.author.user.id,
        params: {
          presetUserId: thread.author.user.id,
        },
      });
    }

    if (action === UNPIN_CONVERSATION) {
      return this.togglePinThread();
    }

    if (action === PIN_CONVERSATION) {
      return this.togglePinThread();
    }

    if (action === UNLOCK_CONVERSATION) {
      return this.toggleLockThread();
    }

    if (action === LOCK_CONVERSATION) {
      return this.toggleLockThread();
    }

    if (action === SUBSCRIBE_CONVERSATION) {
      return this.toggleNotifications();
    }

    if (action === MUTE_CONVERSATION) {
      return this.toggleNotifications();
    }

    if (action === DELETE_CONVERSATION) {
      return triggerDeleteAlert({
        title: '确定删除该对话？',
        subtitle: isAuthor
          ? '该操作无法取消'
          : '该操作无法取消. 同时消息作者会收到相关通知.',
        deleteHandler: () =>
          deleteThread(thread.id).then(result =>
            this.handlePostThreadDelete(result)
          ),
      });
    }
  };

  handlePostThreadDelete = (mutationResult: DeleteThreadType) => {
    const { navigation, refetch } = this.props;
    const { routeName } = navigation.state;
    // depending on where the user was when the thread was deleted, we need to figure out
    // which queries to refetch or how to navigate the user back to a view so that the deleted
    // thread will not be visible
    switch (routeName) {
      case 'Dashboard':
      case 'Community':
      case 'Channel':
      case 'User': {
        return refetch();
      }
      case 'Thread': {
        return navigation.goBack();
      }
      case 'ThreadDetail': {
        return navigation.pop(2);
      }
      default: {
        return () => {};
      }
    }
  };

  onLongPressHandler = () => {
    const { showActionSheetWithOptions } = this.props;
    const actionSheetConfig = this.getActionSheetOptions();
    return showActionSheetWithOptions(
      {
        options: actionSheetConfig.options,
        cancelButtonIndex: actionSheetConfig.cancelButtonIndex,
        destructiveButtonIndex: actionSheetConfig.destructiveButtonIndex,
      },
      index => this.actionSheetEventHandlers(actionSheetConfig.options, index)
    );
  };

  render() {
    const {
      thread,
      activeChannel,
      activeCommunity,
      onPressHandler,
    } = this.props;

    if (!thread.id) return null;
    const facepileUsers = [
      thread.author.user,
      ...thread.participants.filter(
        participant => participant && participant.id !== thread.author.user.id
      ),
    ];

    return (
      <ListItem
        onPressHandler={onPressHandler}
        onLongPressHandler={this.onLongPressHandler}
      >
        <TextColumnContainer>
          <ErrorBoundary fallbackComponent={null}>
            <ThreadCommunityInfo
              activeChannel={activeChannel}
              activeCommunity={activeCommunity}
              thread={thread}
            />
          </ErrorBoundary>

          <Title numberOfLines={2}>{thread.content.title}</Title>

          <ErrorBoundary fallbackComponent={null}>
            <ThreadFacepileRowContainer>
              <Facepile users={facepileUsers} />
              <PillOrMessageCount thread={thread} />
            </ThreadFacepileRowContainer>
          </ErrorBoundary>
        </TextColumnContainer>
      </ListItem>
    );
  }
}

export const ThreadListItem = compose(
  connect(),
  setThreadLockMutation,
  deleteThreadMutation,
  pinThreadMutation,
  connectActionSheet,
  toggleThreadNotificationsMutation,
  withNavigation
)(ThreadListItemHandlers);
