// @flow
import gql from 'graphql-tag'

export type SubscriptionType = {
  id: string,
  created: Date,
  status: string,
  billing_cycle_anchor: Date,
  current_period_end: Date,
  canceled_at: Date,
  discount: ?{
    amount_off: ?number,
    percent_off: ?number,
    id: string,
  },
  items: Array<?{
    id: string,
    created: Date,
    planId: string,
    planName: string,
    amount: number,
    quantity: number,
  }>,
};

export type CommunitySettingsType = {
  hasChargeableSource: boolean,
  hasFeatures: {
    analytics: boolean,
    prioritySupport: boolean,
  },
  billingSettings: {
    administratorEmail: ?string,
    pendingAdministratorEmail?: ?string,
    sources: Array<any>,
    invoices: Array<any>,
    subscriptions: Array<SubscriptionType>,
  },
  joinSettings: {
    tokenJoinEnabled: boolean,
    token: string,
  },
};

export default gql`
  fragment communitySettings on Community {
    hasFeatures {
      analytics
      prioritySupport
    }
    joinSettings {
      tokenJoinEnabled
      token
    }
  }
`
