import React, { FC, useState, ReactElement } from 'react';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'Recoil';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import {
  FormControl,
  Grid,
  InputLabel,
  TextField,
  MenuItem,
  Select,
  Typography,
  Divider,
  Box,
  Snackbar,
  Alert,
  AlertTitle,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

import { orderSelector } from '@/recoil/selectors/order';
import { bookingInfo, formStep, showSubmitButton, formSaving } from '@/recoil/atoms/bookingform';
import api from '@/utils/api';

/* type BookingType = FC & {
  handleNext: () => void;
}; */

interface BookingFormInputs {
  booking_id: string;
  name: string;
}

const schema = yup.object().shape({
  booking_id: yup.string().required(),
  name: yup
    .string()
    .when('booking_id', (bookingId: string, schema: yup.StringSchema) =>
      bookingId === 'new' ? schema.required() : schema,
    ),
});

const Booking: FC = () => {
  const initErrorState = { open: false, message: '' };
  const [err, setErrors] = useState(initErrorState);
  const setNextStep = useSetRecoilState(formStep);
  const [booking, setBooking] = useRecoilState(bookingInfo);
  const setActionButton = useSetRecoilState(showSubmitButton);
  const setFormSavingState = useSetRecoilState(formSaving);
  const orders = useRecoilValue(orderSelector);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormInputs>({ defaultValues: booking, resolver: yupResolver(schema) });

  const handleFormSubmit: SubmitHandler<BookingFormInputs> = async ({ name }) => {
    try {
      setFormSavingState(true);
      const results = await api.post('http://35.200.238.164:9000/basilisk/v0/booking', { name });
      setBooking((curVal) => ({ ...curVal, booking_id: results?.booking?.booking_id }));
      setNextStep((step) => step + 1);
      setFormSavingState(false);
    } catch (err) {
      const { error } = err as { error: string };
      setFormSavingState(false);
      setErrors({ open: true, message: error || 'Something went wrong, try after sometime' });
    }
  };

  const handleChange = (e: SelectChangeEvent) => {
    const value = e.target.value as string;
    setBooking((curVal) => ({ ...curVal, booking_id: value }));
    setActionButton(value === 'new');
  };

  const renderSnackBar = (): ReactElement => {
    return (
      <Snackbar open={true} anchorOrigin={{ horizontal: 'right', vertical: 'top' }}>
        <Alert severity="error" variant="filled" onClose={() => setErrors(initErrorState)}>
          <AlertTitle>Error</AlertTitle>
          {err.message}
        </Alert>
      </Snackbar>
    );
  };

  return (
    <Box>
      {err.open && renderSnackBar()}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5">Booking</Typography>
      </Box>
      <Divider />
      <Box component="form" id="booking-form" noValidate onSubmit={handleSubmit(handleFormSubmit)} sx={{ my: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <FormControl required fullWidth error={!!errors.booking_id}>
              <InputLabel id="booking-label">Select Booking</InputLabel>
              <Controller
                name="booking_id"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="booking-label"
                    label="Select Booking *"
                    onChange={(e) => {
                      field.onChange(e);
                      handleChange(e);
                    }}
                  >
                    <MenuItem value="new">Create New</MenuItem>
                    {orders.map((order: { id: string; name: string }) => (
                      <MenuItem key={order.id} value={order.id}>
                        {order.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Grid>
          {booking.booking_id === 'new' && (
            <Grid item xs={12} md={8}>
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState: { isDirty } }) => (
                  <TextField
                    {...field}
                    error={!!errors.name && !isDirty}
                    variant="outlined"
                    label="Name"
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default Booking;
