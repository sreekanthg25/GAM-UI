import React, { FC, ElementType } from 'react';
import { Route, Redirect, RouteProps } from 'react-router';
import { useRecoilValue, RecoilRoot } from 'Recoil';

import { userSelector } from '@/recoil/selectors/user';
import { Layout as MainLayout } from '@/components';

type ProtectedProps = {
  Layout?: ElementType;
  noLayout?: boolean;
  enableRecoilRoot?: boolean;
} & RouteProps;

const ProtectedRoute: FC<ProtectedProps> = ({ Layout = MainLayout, noLayout, enableRecoilRoot, ...rest }) => {
  const RouteNode = <Route {...rest} />;
  return useRecoilValue(userSelector) ? (
    noLayout ? (
      RouteNode
    ) : (
      <Layout>{enableRecoilRoot ? <RecoilRoot>{RouteNode}</RecoilRoot> : RouteNode}</Layout>
    )
  ) : (
    <Redirect to={{ pathname: '/login', state: { from: rest.location } }} />
  );
};

export default ProtectedRoute;
