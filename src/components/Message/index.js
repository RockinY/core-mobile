// @flow
import React from 'react';
import redraft from 'redraft';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import TouchableOpacity from '../TouchableOpacity';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import Text from '../Text';
import ConditionalWrap from '../ConditionalWrap';
import { messageRenderer } from '../../utils/draftjs/message/renderer';
import { Bubble, TextWrapper, Align } from './style';
import { QuotedMessage } from './QuotedMessage';
import Reactions from './Reactions';
import { replyToMessage } from '../../actions/message';
import toggleReaction from '../../graphql/mutations/reaction/toggleReaction';
import { draftOnlyContainsEmoji } from '../../utils/onlyContainsEmoji';
import { toState, toPlainText } from '../../utils/draftjs';
import type { MessageInfoType } from '../../graphql/fragments/message/messageInfo';
import ImageMessage from './ImageMessage'

type Props = {
  message: MessageInfoType,
  me: boolean,
  threadId?: string,
  bubble?: boolean,
  dispatch: Function,
  toggleReaction: ({ messageId: string, type: 'like' }) => Promise<any>,
  showActionSheetWithOptions: Function,
};

type State = {
  message: MessageInfoType,
};

class Message extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      message: props.message,
    };
  }

  onPress = () => {
    if (!this.props.threadId) return;
    const { message } = this.state;
    const { showActionSheetWithOptions, dispatch, threadId } = this.props;
    showActionSheetWithOptions(
      {
        options: [
          '添加为消息注解',
          message.reactions.hasReacted ? '取消点赞' : '点赞',
          '取消',
        ],
        cancelButtonIndex: 2,
      },
      pressedIndex => {
        switch (pressedIndex) {
          case 0: {
            dispatch(
              replyToMessage({ threadId: threadId, messageId: message.id })
            );
            return;
          }
          case 1: {
            this.setState(({ message }) => ({
              message: {
                ...message,
                reactions: {
                  count: message.reactions.hasReacted
                    ? message.reactions.count - 1
                    : message.reactions.count + 1,
                  hasReacted: !message.reactions.hasReacted,
                },
              },
            }));
            toggleReaction({ messageId: message.id, type: 'like' });
            return;
          }
        }
      }
    );
  };

  render() {
    const { message } = this.state;
    const {
      me,
      bubble,
      showActionSheetWithOptions,
      dispatch,
      threadId,
      toggleReaction,
    } = this.props;
    const emojiOnly =
      message.messageType === 'draftjs'
        ? draftOnlyContainsEmoji(JSON.parse(message.content.body))
        : false;
    if (emojiOnly) {
      return (
        <ConditionalWrap
          condition={bubble !== false}
          wrap={children => (
            <Align me={me}>
              {me && (
                <Reactions style={{ marginRight: 8 }} {...message.reactions} />
              )}
              {children}
              {!me && (
                <Reactions style={{ marginLeft: 8 }} {...message.reactions} />
              )}
            </Align>
          )}
        >
          <Text
            type="body"
            style={{
              fontSize: 32,
              lineHeight: 34 /* Note(@mxstbr): magic number that makes sure emojis aren't cut off */,
            }}
          >
            {toPlainText(toState(JSON.parse(message.content.body)))}
          </Text>
        </ConditionalWrap>
      );
    }
    let body =
      message.messageType === 'draftjs'
        ? redraft(JSON.parse(message.content.body), messageRenderer)
        : message.content.body;
    switch (message.messageType) {
      case 'media': {
        return <ImageMessage src={message.content.body} />
      }
      case 'text':
      case 'draftjs': {
        return (
          <ConditionalWrap
            condition={bubble !== false}
            wrap={children => (
              <TouchableOpacity onPress={this.onPress}>
                <Align me={me}>
                  {me && (
                    <Reactions
                      style={{ marginRight: 8 }}
                      {...message.reactions}
                    />
                  )}
                  <Bubble me={me}>
                    {message.parent ? (
                      /* $FlowIssue */
                      <QuotedMessage message={message.parent} />
                    ) : null}
                    <TextWrapper>{children}</TextWrapper>
                  </Bubble>
                  {!me && (
                    <Reactions
                      style={{ marginLeft: 8 }}
                      {...message.reactions}
                    />
                  )}
                </Align>
              </TouchableOpacity>
            )}
          >
            {body}
          </ConditionalWrap>
        );
      }
      default:
        return null;
    }
  }
}

export default compose(connectActionSheet, toggleReaction, connect())(Message);
