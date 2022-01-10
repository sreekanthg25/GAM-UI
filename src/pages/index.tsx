import React, { lazy, Suspense, ReactElement } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import { useRecoilValue } from 'Recoil';

import { CircularProgress, Box } from '@mui/material';

import { ProtectedRoute } from '@/components';

import { userAdminSelector } from '@/recoil/selectors/user';

const NotFound = lazy(() => import('./notfound'));
const Login = lazy(() => import('./login'));
const Dashboard = lazy(() => import('./dashboard'));
const About = lazy(() => import('./about'));
const BookingForm = lazy(() => import('./bookings/form'));
const BookingList = lazy(() => import('./bookings'));
const LineItemsList = lazy(() => import('./line-items'));
const Settings = lazy(() => import('./settings'));
const CreativesForm = lazy(() => import('./creatives'));
// const OrderLineItems = lazy(() => import('./bookings/details/line-items/list'));

export default function Pages(): ReactElement {
  const isAdmin = useRecoilValue(userAdminSelector);
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      }
    >
      <Switch>
        <Redirect exact from="/" to="/dashboard" />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute exact path="/bookings" component={BookingList} />
        <ProtectedRoute path="/bookings/create" component={BookingForm} />
        {/* <ProtectedRoute path="/bookings/:orderId" component={OrderLineItems} /> */}
        <ProtectedRoute exact path="/line-item" component={LineItemsList} />
        <ProtectedRoute exact path="/creatives" component={CreativesForm} />
        <ProtectedRoute path="/about" component={About} />
        <Redirect exact from="/settings" to="/settings/configs" />
        {isAdmin && <ProtectedRoute path="/settings" component={Settings} />}
        <Route path="/login" component={Login} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}
