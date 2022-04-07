import React, { FC, useState } from 'react';
import { Link as RouteLink } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'Recoil';

import {
  Typography,
  Box,
  Divider,
  Button,
  Grid,
  Link,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TableCellProps,
} from '@mui/material';

import { LoadingButton } from '@mui/lab';
import { DeleteRounded } from '@mui/icons-material';

import { configsSelector } from '@/recoil/selectors/configs';
import { CustomTable } from '@/components';
import { refreshConfigs } from '@/recoil/atoms/configs';
import api from '@/utils/api';

type RecordType = Record<string, unknown> | undefined | string;

const Configs: FC = () => {
  const configLists = useRecoilValue(configsSelector);
  const setConfigRefresh = useSetRecoilState(refreshConfigs);
  const [isDialogOpen, setDialogState] = useState(false);
  const [isActionLoading, setActionLoading] = useState(false);
  const [actionRow, setActionRow] = useState<RecordType | null>(null);

  const onDelete = (name: RecordType) => {
    setDialogState(true);
    setActionRow(name);
  };

  const renderNameCell = (name: RecordType) => {
    return (
      <Link component={RouteLink} to={{ pathname: `configs/edit/${name}`, state: { name } }}>
        {name}
      </Link>
    );
  };
  const renderActions = (row: RecordType) => {
    const { bucket_name } = row as Record<string, string>;
    return (
      <Box>
        <IconButton onClick={() => onDelete(bucket_name)}>
          <DeleteRounded />
        </IconButton>
      </Box>
    );
  };

  const handleDialogClose = () => {
    setDialogState(false);
  };

  const onAction = async () => {
    setActionLoading(true);
    await api.delete(`/basilisk/v0/account/metadata/${actionRow}`);
    setActionLoading(false);
    handleDialogClose();
    setConfigRefresh((currVal) => currVal + 1);
  };

  const renderDialog = () => {
    return (
      <Dialog open={isDialogOpen}>
        <DialogTitle>{`Delete ${actionRow}`}</DialogTitle>
        <DialogContent>
          <DialogContentText>{`Are you sure you want to delete config ${actionRow}`}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button disabled={isActionLoading} onClick={handleDialogClose}>
            Cancel
          </Button>
          <LoadingButton color="info" variant="contained" loading={isActionLoading} onClick={onAction} autoFocus>
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    );
  };
  const columns = [
    { label: 'Name', field: 'bucket_name', renderer: renderNameCell },
    { label: 'Action', renderer: renderActions, cellProps: { align: 'right' } as TableCellProps },
  ];
  return (
    <Box sx={{ py: 5, px: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Typography variant="h4">Configs</Typography>
            <Button variant="contained" component={RouteLink} to="configs/new">
              Add New
            </Button>
          </Box>
          <Divider sx={{ mt: 2 }} />
        </Grid>
        <Grid item xs={12}>
          {<CustomTable rows={configLists} columns={columns} />}
        </Grid>
      </Grid>
      {renderDialog()}
    </Box>
  );
};

export default Configs;
