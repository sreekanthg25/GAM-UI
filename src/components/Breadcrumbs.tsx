import React, { FC } from 'react';
import { Typography, Breadcrumbs as MuiBreadcrumbs, Link } from '@mui/material';
import { useHistory, Link as RouterLink } from 'react-router-dom';

const Breadcrumbs: FC = () => {
  const history = useHistory();
  const pathArr = history.location.pathname.split('/');
  const len = pathArr.length;
  const activeRouteName = pathArr[len - 1];
  return (
    <MuiBreadcrumbs sx={{ my: 2 }} aria-label="breadcrumb">
      {pathArr.slice(0, len - 1).map((val, index) => {
        const name = val ? val : 'home';
        const routeTo = `/${pathArr.slice(1, index + 1).join('/')}`;
        return (
          <Link
            sx={{ textTransform: 'capitalize' }}
            key={index}
            underline="hover"
            color="inherit"
            component={RouterLink}
            to={routeTo}
          >
            {name}
          </Link>
        );
      })}
      <Typography sx={{ textTransform: 'capitalize' }} color="text.primary">
        {activeRouteName}
      </Typography>
    </MuiBreadcrumbs>
  );
};

export default Breadcrumbs;
