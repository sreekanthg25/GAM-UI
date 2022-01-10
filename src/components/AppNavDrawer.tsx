import React, { FC } from 'react';
import { Link as RouteLink } from 'react-router-dom';

import { useRecoilValue } from 'Recoil';

import { Box, Drawer, Toolbar, List, ListItemButton, ListItemText, ListItemIcon } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Schedule as ScheduleIcon,
  LibraryBooks as LibraryBooksIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

import { userAdminSelector } from '@/recoil/selectors/user';

import pages, { NavPage } from '../pages/nav';

const iconsMap: Record<string, unknown> = {
  DashboardIcon: DashboardIcon,
  ScheduleIcon: ScheduleIcon,
  LibraryBooksIcon: LibraryBooksIcon,
  SettingsIcon: SettingsIcon,
};

const drawerWidth = 240;

const AppNavDrawer: FC = () => {
  const isAdmin = useRecoilValue(userAdminSelector);
  const renderNav = (page: NavPage) => {
    const { title, icon, path, adminOnly } = page;
    if (adminOnly && !isAdmin) {
      return null;
    }
    const hasIcon = icon && iconsMap[icon];
    const IconComponent = (hasIcon || React.Fragment) as React.ComponentType;
    return (
      <Box key={title}>
        <ListItemButton divider component={RouteLink} to={path}>
          <ListItemIcon>
            <IconComponent />
          </ListItemIcon>
          <ListItemText primary={title} />
        </ListItemButton>
      </Box>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <List>{pages.map(renderNav)}</List>
    </Drawer>
  );
};

export default AppNavDrawer;
