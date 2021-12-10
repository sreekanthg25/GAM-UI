import React, { FC, useState, useEffect, useMemo, ReactElement } from 'react';
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'Recoil';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { addHours } from 'date-fns';

/* Material UI */
import { Grid, TextField, Box, Divider, Typography, Autocomplete, Snackbar, Alert, AlertTitle } from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import DatePicker from '@mui/lab/DateTimePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

import api from '@/utils/api';
import { lineItemInfo, bookingInfo, formStep, formSaving, stepCompleted, lineItemId } from '@/recoil/atoms/bookingform';
import { lineItemsSelector } from '@/recoil/selectors/lineitems';

import { CreativeProps, LineItemFormInputs } from './formTypes';
import { transformPayloadData } from './helpers';

const schema = yup.object().shape({
  name: yup.string().required(),
  creative_placeholders: yup.array().min(1),
  budget: yup.number().min(1000).required(),
  cpm: yup.number().min(1).required(),
  startDate: yup.date().required(),
  endDate: yup.date().required(),
});

const LineItem: FC = () => {
  const initErrorState = { open: false, message: '' };
  const [err, setErrors] = useState(initErrorState);
  const [lineItemDefault, setLineItem] = useRecoilState(lineItemInfo);
  const setNextStep = useSetRecoilState(formStep);
  const setFormSavingState = useSetRecoilState(formSaving);
  const booking = useRecoilValue(bookingInfo);
  const setStepCompletion = useSetRecoilState(stepCompleted(1));
  const setLineItemId = useSetRecoilState(lineItemId);
  const lineItems = useRecoilValue(lineItemsSelector);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LineItemFormInputs>({ defaultValues: lineItemDefault, resolver: yupResolver(schema) });

  const [creatives, setCreatives] = useState([]);
  const [creativesLoading, setLoading] = useState(false);
  const startMinDate = useMemo(() => new Date(), []);
  const [cpmValue, budgetValue, selectedStartDate] = watch(['cpm', 'budget', 'startDate']);

  const endMinDate = useMemo(() => {
    const hoursDiff = 6;
    return selectedStartDate ? addHours(selectedStartDate, hoursDiff) : addHours(startMinDate, hoursDiff);
  }, [selectedStartDate, startMinDate]);

  useEffect(() => {
    if (selectedStartDate) {
      setValue('endDate', endMinDate);
    }
  }, [selectedStartDate, endMinDate, setValue]);

  useEffect(() => {
    if (cpmValue && budgetValue) {
      const impressions = Math.round((budgetValue * 1000) / cpmValue);
      setValue('impressions', impressions);
    }
  }, [cpmValue, budgetValue, setValue]);

  useEffect(() => {
    const getCreatives = async () => {
      setLoading(true);
      const results = await api.get('http://35.200.238.164:9000/basilisk/v0/creativesizes');
      setCreatives(
        results.filter(
          (obj: CreativeProps) => !!obj.name && (obj.type === 'PIXEL' || obj.type === 'SYSTEM_DEFINED_NATIVE'),
        ),
      );
      setLoading(false);
    };
    getCreatives();
  }, []);

  const handleFormSubmit: SubmitHandler<LineItemFormInputs> = async (data) => {
    try {
      setFormSavingState(true);
      const payload = transformPayloadData({ ...data, booking_id: booking.booking_id });
      const results = await api.post('http://35.200.238.164:9000/basilisk/v0/lineitem', payload);
      setLineItem(data);
      setNextStep((step) => step + 1);
      setFormSavingState(false);
      setStepCompletion(true);
      setLineItemId(results?.gp_line_item?.gplineitem_id);
    } catch (err) {
      const { error } = err as { error: string };
      setFormSavingState(false);
      setErrors({ open: true, message: error || 'Something went wrong, try after sometime' });
    }
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
        <Typography variant="h5">Line Item</Typography>
      </Box>
      <Divider />
      <Box component="form" id="line-item-form" noValidate onSubmit={handleSubmit(handleFormSubmit)} sx={{ my: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Controller
              control={control}
              name="line_item"
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  options={[{ name: 'Create New', id: 'new' }, ...lineItems]}
                  getOptionLabel={(option) => {
                    console.log(option);
                    return option.name;
                  }}
                  onChange={(_, data) => field.onChange(data)}
                  isOptionEqualToValue={(option, value) => {
                    // console.log(option, value);
                    return option.id === value || value.id;
                  }}
                  filterSelectedOptions
                  renderInput={(params) => <TextField {...params} variant="outlined" label="Select Line Item" />}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <TextField {...field} error={!!errors.name} variant="outlined" label="Name" required fullWidth />
              )}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Controller
              control={control}
              name="creative_placeholders"
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  multiple
                  loading={creativesLoading}
                  limitTags={3}
                  options={creatives}
                  getOptionLabel={(option: CreativeProps) => option.name}
                  onChange={(_, data) => field.onChange(data)}
                  filterSelectedOptions
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      error={!!errors.creative_placeholders}
                      variant="outlined"
                      label="Select Creatives"
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} container spacing={4}>
            <Grid item md={4}>
              <Controller
                control={control}
                name="budget"
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    helperText="minimum value is 1000"
                    error={!!errors.budget}
                    variant="outlined"
                    label="Budget (INR)"
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item md={4}>
              <Controller
                control={control}
                name="cpm"
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    helperText="enter +ve value only"
                    error={!!errors.cpm}
                    variant="outlined"
                    label="CPM (INR)"
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item md={4}>
              <Controller
                control={control}
                name="impressions"
                render={({ field }) => (
                  <TextField
                    {...field}
                    variant="outlined"
                    label="Impressions"
                    InputLabelProps={{ shrink: true }}
                    disabled
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} container spacing={4}>
            <Grid item md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      minDateTime={startMinDate}
                      label="Start Date"
                      inputFormat="dd/MM/yyyy HH:mm"
                      renderInput={(params) => <TextField {...params} error={!!errors.startDate} required />}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      minDateTime={endMinDate}
                      label="End Date"
                      inputFormat="dd/MM/yyyy HH:mm"
                      renderInput={(params) => <TextField {...params} error={!!errors.endDate} required />}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default LineItem;
