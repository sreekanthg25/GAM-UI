import React, { FC } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useRecoilValue } from 'Recoil';

import { Card, CardHeader, Avatar, CardContent, Typography, Box, Button, Grid } from '@mui/material';
import { Campaign, DoubleArrow } from '@mui/icons-material';
import { blueGrey } from '@mui/material/colors';

import { orderSelector } from '@/recoil/selectors/order';

const Dashboard: FC = () => {
  const orders = useRecoilValue(orderSelector);
  return (
    <Grid container spacing={4}>
      <Grid item xs={8} md={4}>
        <Button component={RouterLink} to="/bookings/create" variant="contained" fullWidth size="large">
          Create New Booking
        </Button>
      </Grid>
      <Grid item xs={10} md={10}>
        <Card sx={{ maxWidth: 400 }}>
          <CardHeader
            title={
              <Typography variant="h5" component="h1">
                Bookings
              </Typography>
            }
            avatar={
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <Campaign />
              </Avatar>
            }
            sx={{ bgcolor: blueGrey[500] }}
          />
          <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography>Total Count</Typography>
              <Typography variant="h4" component="div">
                {orders.length}
              </Typography>
            </Box>
            <Box>
              <Avatar>
                <DoubleArrow />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
/* <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Recent Campaigns
          </Typography>
          <Typography component="p" variant="h4">
            10
          </Typography>
          <Typography color="text.secondary" sx={{ flex: 1 }}>
            last created on 15 August, 2021
          </Typography>
          <div>
            <Link color="primary" href="#">
              Create New
            </Link>
          </div>
        </Paper>
      </Grid>
    </Container> */

export default Dashboard;
