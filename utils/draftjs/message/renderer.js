// @flow
import React from 'react';
import mentionsDecorator from '../mentions-decorator';
import linksDecorator from '../links-decorator';
import { BodyText } from '../../../components/ThreadContent/style';
import Text from '../../../components/Text';
import {
  CodeBlock,
  InlineCodeBlock,
} from '../../../components/Codeblock';
import type { Node } from 'react';
import type { KeyObj, KeysObj } from './types';

const messageRenderer = {
  inline: {
    BOLD: (children: Array<Node>, { key }: KeyObj) => (
      <Text type="body" weight="bold" key={`bold-${key}`}>
        {children}
      </Text>
    ),
    ITALIC: (children: Array<Node>, { key }: KeyObj) => (
      <Text type="body" italic key={`italic-${key}`}>
        {children}
      </Text>
    ),
    CODE: (children: string, { key }: KeyObj) => (
      <InlineCodeBlock key={`inline-codeblock-${key}`}>
        {children}
      </InlineCodeBlock>
    ),
  },
  blocks: {
    unstyled: (children: Array<Node>, { keys }: KeysObj) =>
      // $FlowFixMe
      children.map((child, index) => (
        <Text type="body" key={keys[index] || index}>
          {child}
        </Text>
      )),
    'code-block': (children: string, { keys }: KeysObj) => (
      <CodeBlock key={keys.join('|')}>{children}</CodeBlock>
    ),
  },
  decorators: [mentionsDecorator, linksDecorator],
};

export { messageRenderer };
