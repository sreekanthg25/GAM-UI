import React, { FC, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'Recoil';
import { Link as RouteLink } from 'react-router-dom';

import {
  Typography,
  Box,
  Grid,
  Divider,
  Button,
  TableCellProps,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  DialogContentText,
  Link,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { CustomTable } from '@/components';
import { orderSelector } from '@/recoil/selectors/order';

import { refreshBooking } from '@/recoil/atoms/bookingform';

import api from '@/utils/api';

type RecordType = Record<string, unknown> | undefined | string;

const BookingsList: FC = () => {
  const orders = useRecoilValue(orderSelector);
  const [isDialogOpen, setDialogState] = useState(false);
  const [actionRow, setActionRow] = useState<Record<string, string>>({});
  const [isActionLoading, setActionLoading] = useState(false);
  const refreshBookingData = useSetRecoilState(refreshBooking);

  const handleDialogClose = () => {
    setDialogState(false);
  };
  const onMigrateConfirm = async () => {
    const { order_id } = actionRow;
    setActionLoading(true);
    await api.post(`http://35.200.238.164:9000/basilisk/v0/migrate/booking/${order_id}`);
    setActionLoading(false);
    handleDialogClose();
    refreshBookingData((currVal) => currVal + 1);
  };
  const renderDialog = () => {
    const { name } = actionRow;
    return (
      <Dialog open={isDialogOpen}>
        <DialogTitle>{`Migrate ${name}`}</DialogTitle>
        <DialogContent>
          <DialogContentText>{`Are you sure you want to Migrate config ${name}`}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={isActionLoading} onClick={handleDialogClose}>
            Cancel
          </Button>
          <LoadingButton
            color="info"
            variant="contained"
            loading={isActionLoading}
            onClick={onMigrateConfirm}
            autoFocus
          >
            Migrate
          </LoadingButton>
        </DialogActions>
      </Dialog>
    );
  };

  const onMigrate = (row: Record<string, string>) => {
    setDialogState(true);
    setActionRow(row);
  };

  const renderNameCell = (row: RecordType) => {
    const { name, id } = row as Record<string, string>;
    return (
      <Link component={RouteLink} to={{ pathname: '/line-item', search: `?oid=${id}` }}>
        {name}
      </Link>
    );
  };

  const renderActions = (row: RecordType) => {
    const selectedRow = row as Record<string, string>;
    if (selectedRow.id) {
      return null;
    }
    return (
      <Box>
        <Button onClick={() => onMigrate(selectedRow)}>Migrate</Button>
      </Box>
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
      {renderDialog()}
    </Box>
  );
};

export default BookingsList;
