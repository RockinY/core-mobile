// @flow
import React from 'react';
import { createBottomTabNavigator } from 'react-navigation';
import theme from '../../components/theme';
import HomeStack from './HomeStack';
import ProfileStack from './ProfileStack';
import NotificationsStack from './NotificationsStack';
import DMStack from './DirectMessageStack';
import SearchStack from './SearchStack';
import {
  SearchIcon,
  HomeIcon,
  MessageIcon,
  NotificationIcon,
  ProfileIcon,
} from './Icons';

const shouldRenderTabBar = navigation => {
  let showTabbar = true;

  const { routes } = navigation.state;
  const nonTabbarRoutes = ['Thread', 'DirectMessageThread'];

  routes.forEach(route => {
    if (nonTabbarRoutes.indexOf(route.routeName) >= 0) {
      showTabbar = false;
    }
  });

  return showTabbar;
};

const routeConfiguration = {
  Home: {
    screen: HomeStack,
    navigationOptions: {
      tabBarLabel: '首页',
      tabBarIcon: ({ tintColor }) => <HomeIcon color={tintColor} />,
    },
  },
  Messages: {
    screen: DMStack,
    navigationOptions: {
      tabBarLabel: '消息',
      tabBarIcon: ({ tintColor }) => <MessageIcon color={tintColor} />,
    },
  },
  Search: {
    screen: SearchStack,
    navigationOptions: {
      tabBarLabel: '搜索',
      tabBarIcon: ({ tintColor }) => <SearchIcon color={tintColor} />,
    },
  },
  Notifications: {
    screen: NotificationsStack,
    navigationOptions: {
      tabBarLabel: '通知',
      tabBarIcon: ({ tintColor }) => <NotificationIcon color={tintColor} />,
    },
  },
  Profile: {
    screen: ProfileStack,
    navigationOptions: {
      tabBarLabel: '我的',
      tabBarIcon: ({ tintColor }) => <ProfileIcon color={tintColor} />,
    },
  },
};

const tabBarConfiguration = {
  initialRouteName: 'Home',
  tabBarOptions: {
    activeTintColor: theme.brand.alt,
    inactiveTintColor: theme.text.alt,
    labelStyle: {
      fontWeight: 'bold',
      marginBottom: 3,
    },
    style: {},
  },
  navigationOptions: ({ navigation }) => ({
    tabBarVisible: shouldRenderTabBar(navigation),
  }),
};

// NOTE(@mxstbr): I figured this out manually by simply inspecting in the simulator
export const TAB_BAR_HEIGHT = 375;

export default createBottomTabNavigator(
  routeConfiguration,
  tabBarConfiguration
);
