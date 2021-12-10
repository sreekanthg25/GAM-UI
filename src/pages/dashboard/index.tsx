import React, { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useRecoilValue } from 'Recoil';

import { Button, Grid, Box, Typography } from '@mui/material';
import { pink, teal } from '@mui/material/colors';

import { orderSelector } from '@/recoil/selectors/order';
import { lineItemsSelector } from '@/recoil/selectors/lineitems';
import { DashboardCard } from '@/components';

const Dashboard: FC = () => {
  const orders = useRecoilValue(orderSelector);
  const lineItems = useRecoilValue(lineItemsSelector);
  return (
    <Grid container spacing={8}>
      <Grid item xs={10} md={8} sx={{ margin: 'auto' }}>
        <Box
          sx={{
            borderRadius: '10px',
            border: 1,
            borderColor: 'divider',
            px: 2,
            py: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}
        >
          <img src="assets/img/users1.png" height="120px" alt="dashboard image" />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Reach 100 million users
            </Typography>
            <Button component={RouterLink} to="/bookings/create" variant="contained" size="medium">
              Create New Booking
            </Button>
          </Box>
        </Box>
      </Grid>
      <Grid item container xs={12} spacing={5} sx={{ justifyContent: 'space-around' }}>
        <Grid item xs={10} md={5}>
          <DashboardCard bgColor={pink[500]} count={orders.length} title="Total Bookings" action="/bookings" />
        </Grid>
        <Grid item xs={10} md={5}>
          <DashboardCard bgColor={teal[500]} count={lineItems.length} title="Total Line Items" action="/line-items" />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
