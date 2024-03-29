import React, { lazy, FC } from 'react';
import { Switch, Route } from 'react-router-dom';

const Configs = lazy(() => import('./configs'));
const ConfigsForm = lazy(() => import('./configs/config-form'));

const SettingsRoute: FC = () => {
  return (
    <Switch>
      <Route exact component={Configs} path="/admin-settings/configs" />
      <Route component={ConfigsForm} path="/admin-settings/configs/new" />
      <Route component={ConfigsForm} path="/admin-settings/configs/edit/:configName" />
    </Switch>
  );
};

export default SettingsRoute;
