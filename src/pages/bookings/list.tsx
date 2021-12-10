import React, { FC } from 'react';
import { useRecoilValue } from 'Recoil';
import { Link as RouteLink } from 'react-router-dom';

import { Typography, Box, Grid, Divider, Button } from '@mui/material';

import { CustomTable } from '@/components';
import { orderSelector } from '@/recoil/selectors/order';

const columns = [{ label: 'Name', field: 'name' }];

const BookingsList: FC = () => {
  const orders = useRecoilValue(orderSelector);
  return (
    <Box sx={{ py: 5, px: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Typography variant="h4">Bookings</Typography>
            <Button variant="contained" component={RouteLink} to="bookings/create">
              Create
            </Button>
          </Box>
          <Divider sx={{ mt: 2 }} />
        </Grid>
        <Grid item xs={12}>
          <CustomTable rows={orders || []} columns={columns} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookingsList;
