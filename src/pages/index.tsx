import React, { lazy, Suspense, ReactElement } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import { CircularProgress, Box } from '@mui/material';

import { ProtectedRoute } from '@/components';

const NotFound = lazy(() => import('./notfound'));
const Login = lazy(() => import('./login'));
const Dashboard = lazy(() => import('./dashboard'));
const About = lazy(() => import('./about'));
const BookingForm = lazy(() => import('./bookings/form'));

export default function Pages(): ReactElement {
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
        <ProtectedRoute path="/bookings/create" component={BookingForm} />
        <ProtectedRoute path="/about" component={About} />
        <Route path="/login" component={Login} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}