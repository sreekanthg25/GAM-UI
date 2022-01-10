import React, { FC } from 'react';
import { useLocation } from 'react-router-dom';

import { useRecoilValue } from 'Recoil';

import { Link as RouteLink } from 'react-router-dom';

import { Typography, Box, Grid, Divider, IconButton, TableCellProps } from '@mui/material';
import { AddPhotoAlternate } from '@mui/icons-material';

import { lineItemsSelector, lineItemsByOrderId } from '@/recoil/selectors/lineitems';
import { CustomTable } from '@/components';

type RecordType = Record<string, unknown> | undefined | string;

const OrderLineItems: FC = () => {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const orderId = queryParams.get('oid');
  const lineItems = useRecoilValue(orderId ? lineItemsByOrderId(orderId) : lineItemsSelector);

  const renderActions = (row: RecordType) => {
    const selectedRow = row as Record<string, string>;
    return (
      <Box>
        <IconButton
          component={RouteLink}
          to={{ pathname: `/creatives`, search: `?lid=${selectedRow.id}&oid=${orderId}` }}
        >
          <AddPhotoAlternate />
        </IconButton>
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
            <Typography variant="h4">Line Items</Typography>
          </Box>
          <Divider sx={{ mt: 2 }} />
        </Grid>
        <Grid item xs={12}>
          <CustomTable rows={lineItems} columns={columns} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderLineItems;
