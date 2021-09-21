import React, { FC } from 'react';
import { Typography } from '@mui/material';

const Copyright: FC = () => {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © GAM '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
};

export default Copyright;
