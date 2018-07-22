// @flow
import React from 'react';
import createLinksDecorator, {
  type LinksDecoratorComponentProps,
} from './core';
import { MessageAnchor } from '../../../components/Anchor';

export default createLinksDecorator((props: LinksDecoratorComponentProps) => (
  <MessageAnchor href={props.href}>{props.children}</MessageAnchor>
));
