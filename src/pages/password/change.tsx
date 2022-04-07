import React, { FC, useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useResetRecoilState } from 'Recoil';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import {
  Typography,
  Box,
  Divider,
  Paper,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { userSelector } from '@/recoil/selectors/user';

import { AlertNotification, NotificationTypes } from '@/components';

import api from '@/utils/api';

interface FormInputProps {
  current_pass: string;
  new_pass: string;
  confirm_password: string;
}

const schema = yup.object().shape({
  current_pass: yup.string().required(),
  new_pass: yup.string().required().min(8, 'Password must be at least 8 characters'),
  confirm_password: yup
    .string()
    .required()
    .oneOf([yup.ref('new_pass'), null], 'Passwords must match'),
});

const ChangePassword: FC = () => {
  const [toast, setToastMessage] = useState<NotificationTypes | null>(null);
  const resetUser = useResetRecoilState(userSelector);
  const [isSubmitting, setSubmittingState] = useState(false);
  const [showSuccessDialog, setSuccessState] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputProps>({
    defaultValues: { current_pass: '', new_pass: '', confirm_password: '' },
    resolver: yupResolver(schema),
  });

  const handelCP: SubmitHandler<FormInputProps> = async (data) => {
    const { new_pass, current_pass } = data;
    setSubmittingState(true);
    try {
      await api.post('/v1/change-password', { new_pass, current_pass });
      setSuccessState(true);
    } catch (err) {
      const { error } = err as { error: string };
      setToastMessage({ open: true, type: 'error', message: error || 'Something went wrong, try after sometime' });
    } finally {
      setSubmittingState(false);
    }
  };

  const handleDialogClose = () => {
    setSuccessState(false);
    resetUser();
  };

  const onCloseToast = () => {
    setToastMessage(null);
  };

  const renderSuccessDialog = () => {
    return showSuccessDialog ? (
      <Dialog open={true}>
        <DialogTitle>{`Password changed successfully`}</DialogTitle>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button color="success" variant="contained" onClick={handleDialogClose}>
            ReLogin
          </Button>
        </DialogActions>
      </Dialog>
    ) : null;
  };

  return (
    <Box>
      {toast?.open && <AlertNotification {...toast} onClose={onCloseToast} />}
      <Typography variant="h4">Change Password</Typography>
      <Divider sx={{ py: 2 }} />
      <Grid container spacing={2}>
        <Paper sx={{ p: 4, mt: 7, mx: 2 }}>
          <Box component="form" onSubmit={handleSubmit(handelCP)} noValidate sx={{ mt: 1 }}>
            <Grid item container spacing={4} md={8}>
              <Grid item xs={12}>
                <Controller
                  name="current_pass"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      required
                      type="password"
                      label="Old Password"
                      error={!!errors.current_pass}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="new_pass"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      required
                      type="password"
                      label="New Password"
                      error={!!errors.new_pass}
                      helperText={errors.new_pass?.type === 'min' ? errors.new_pass.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="confirm_password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      required
                      type="password"
                      label="Confirm Password"
                      error={!!errors.confirm_password}
                      helperText={errors.confirm_password?.type === 'oneOf' ? errors.confirm_password.message : null}
                    />
                  )}
                />
              </Grid>
              <Grid item>
                <LoadingButton loading={isSubmitting} variant="contained" type="submit">
                  Submit
                </LoadingButton>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grid>
      {renderSuccessDialog()}
    </Box>
  );
};

export default ChangePassword;
