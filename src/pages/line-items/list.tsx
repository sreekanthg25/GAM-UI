import React, { FC } from 'react';
import { useRecoilValue } from 'Recoil';

import { Typography, Box, Grid, Divider } from '@mui/material';

import { lineItemsSelector } from '@/recoil/selectors/lineitems';
import { CustomTable } from '@/components';

const columns = [{ label: 'Name', field: 'name' }];

const LineItemsList: FC = () => {
  const lineItems = useRecoilValue(lineItemsSelector);
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

export default LineItemsList;
