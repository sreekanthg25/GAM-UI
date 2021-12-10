import React, { FC } from 'react';
import { Link as RouteLink } from 'react-router-dom';

import { Box, Drawer, Toolbar, List, ListItemButton, ListItemText, ListItemIcon } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Schedule as ScheduleIcon,
  LibraryBooks as LibraryBooksIcon,
} from '@mui/icons-material';

import pages, { NavPage } from '../pages/nav';

const iconsMap: Record<string, unknown> = {
  DashboardIcon: DashboardIcon,
  ScheduleIcon: ScheduleIcon,
  LibraryBooksIcon: LibraryBooksIcon,
};

const drawerWidth = 240;

const AppNavDrawer: FC = () => {
  const renderNav = (page: NavPage) => {
    const { title, icon, path } = page;
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
