import React, { FC /* , useState */ } from 'react';
import { Link as RouteLink /* , Route */ } from 'react-router-dom';

import { Typography, Box, Divider, Grid, MenuList, MenuItem, ListItemText } from '@mui/material';

import { styled } from '@mui/material/styles';

import SettingsRoutes from './admin-settings-routes';

// import Configs from './configs';

const menuList = [
  {
    name: 'configs',
    label: 'Configs',
  },
];

const MenuListStyled = styled(MenuList)(({ theme }) => {
  return {
    height: '100%',
    overflowY: 'auto',
    borderRight: '1px solid',
    fontSize: theme.typography.caption.fontSize,
    borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
  };
});

const Settings: FC = () => {
  // const [selectedItem] = useState(menuList[0]);
  return (
    <Box sx={{ py: 5, px: 3, height: '100%' }}>
      <Box>
        <Typography variant="h4">Admin Settings</Typography>
        <Divider sx={{ mt: 2 }} />
      </Box>
      <Box sx={{ height: 'inherit' }}>
        <Grid container spacing={2} sx={{ height: 'inherit' }}>
          <Grid item xs={2} sx={{ height: 'inherit' }}>
            <MenuListStyled>
              {menuList.map(({ name, label }, idx) => (
                <MenuItem key={name} selected={idx === 0} component={RouteLink} to={`/admin-settings/${name}`}>
                  <ListItemText>{label}</ListItemText>
                </MenuItem>
              ))}
            </MenuListStyled>
          </Grid>
          <Grid item xs={10}>
            <SettingsRoutes />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Settings;
