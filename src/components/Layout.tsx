import React, { FC } from 'react';
import { Link as RouteLink } from 'react-router-dom';
import { AppBar, Box, Toolbar, Link, IconButton, MenuItem, Menu } from '@mui/material';
import { Menu as MenuIcon, AccountCircle } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { useResetRecoilState } from 'Recoil';

import { userSelector } from '@/recoil/selectors/user';

import { AppNavDrawer } from '@/components';

const Layout: FC = ({ children }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const history = useHistory();
  const resetUser = useResetRecoilState(userSelector);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const logout = () => {
    resetUser();
    history.replace('/login');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AppBar enableColorOnDark position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Link underline="none" variant="h6" component={RouteLink} to="/" sx={{ color: 'grey.800', flexGrow: 1 }}>
            GAM
          </Link>
          <div>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleClose}>My account</MenuItem>
              <MenuItem onClick={logout}>Logout</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <AppNavDrawer />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
