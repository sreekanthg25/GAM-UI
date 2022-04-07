import React, { FC } from 'react';

import { useLocation, useParams, Link as RouteLink } from 'react-router-dom';
import { useRecoilValue } from 'Recoil';

import {
  Typography,
  Box,
  Grid,
  Divider,
  Button,
  TableCellProps,
  /* Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  DialogContentText,
  Link, */
} from '@mui/material';

import { CustomTable } from '@/components';
import { creativesByLineItem } from '@/recoil/selectors/creatives';

type ParamTypes = { lid: string };
type RecordType = Record<string, unknown> | undefined | string;

const LineItemDetails: FC = () => {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const { lid } = useParams<ParamTypes>();
  const orderId = queryParams.get('oid');
  const creatives = useRecoilValue(creativesByLineItem(lid));

  const renderActions = (row: RecordType) => {
    const selectedRow = row as Record<string, string>;
    return (
      <Box>
        <Button
          component={RouteLink}
          to={{
            pathname: `/creatives/${selectedRow.id}/edit`,
            search: `?lid=${lid}${orderId ? `&oid=${orderId}` : ''}`,
          }}
        >
          Edit
        </Button>
      </Box>
    );
  };

  const columns = [
    { label: 'Name', field: 'name' },
    { label: 'Action', renderer: renderActions, cellProps: { align: 'right' } as TableCellProps },
  ];

  return (
    <Box sx={{ py: 5, px: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Typography variant="h4">Creatives</Typography>
            <Button
              variant="contained"
              component={RouteLink}
              to={{ pathname: `/creatives`, search: `?lid=${lid}${orderId ? `&oid=${orderId}` : ''}` }}
            >
              Add Creatives
            </Button>
          </Box>
          <Divider sx={{ mt: 2 }} />
        </Grid>
        <Grid item xs={12}>
          <CustomTable rows={creatives || []} columns={columns} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default LineItemDetails;
