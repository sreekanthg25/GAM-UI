import React, { FC } from 'react';
import { useLocation, Link as RouteLink } from 'react-router-dom';

import { useRecoilValue } from 'Recoil';

import { Typography, Box, Grid, Divider, Button, TableCellProps, Link } from '@mui/material';

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
        <Button
          component={RouteLink}
          to={{ pathname: `/creatives`, search: `?lid=${selectedRow.id}${orderId ? `&oid=${orderId}` : ''}` }}
        >
          Add Creatives
        </Button>
      </Box>
    );
  };

  const renderNameCell = (row: RecordType) => {
    const { name, id } = row as Record<string, string>;
    return (
      <Link component={RouteLink} to={{ pathname: `/line-item/${id}` }}>
        {name}
      </Link>
    );
  };

  const columns = [
    { label: 'Name', renderer: renderNameCell },
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
