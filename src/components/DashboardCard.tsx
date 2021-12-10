import React, { FC } from 'react';
import { Link as RouteLink } from 'react-router-dom';

import { Card, CardContent, Typography, Box, IconButton } from '@mui/material';

import { ArrowForwardIos as ArrowIcon } from '@mui/icons-material';

type CardProps = {
  bgColor: string;
  action: string;
  title: string;
  count: number;
};

const DashboardCard: FC<CardProps> = (props: CardProps) => {
  const { bgColor, action, title, count } = props;
  return (
    <Card>
      <CardContent sx={{ bgcolor: bgColor, p: 4, color: 'common.white' }}>
        <Box>
          <Typography gutterBottom variant="h3" component="div">
            {count}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" component="span">
            {title}
          </Typography>
          <IconButton size="large" component={RouteLink} to={action} sx={{ color: 'common.white' }}>
            <ArrowIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
