import React, { FC, useState, useEffect, useMemo } from 'react';
import { useRecoilValue } from 'Recoil';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { addDays } from 'date-fns';

/* Material UI */
import { Grid, TextField, Box, Divider, Typography, Autocomplete } from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import DatePicker from '@mui/lab/DatePicker';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

import api from '@/utils/api';
import { lineItemInfo } from '@/recoil/atoms/bookingform';

/* type LineItemType = FC & {
  onSubmit: () => void;
}; */

type CreativeProps = {
  name: string;
  id: number;
  type: string;
  size: {
    width: number;
    height: number;
  };
};

type LineItemFormInputs = {
  name: string;
  creative_placeholders: CreativeProps[];
  budget: number;
  cpm: number;
  impressions: number;
  startDate: Date | null;
  endDate: Date | null;
};

const schema = yup.object().shape({
  name: yup.string().required(),
  creative_placeholders: yup.array().min(1),
  budget: yup.number().min(1000).required(),
  cpm: yup.number().min(1).required(),
  startDate: yup.date().required(),
  endDate: yup.date().required(),
});

const LineItem: FC = () => {
  const lineItemDefault = useRecoilValue(lineItemInfo);
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
    return selectedStartDate ? addDays(selectedStartDate, 1) : addDays(startMinDate, 1);
  }, [selectedStartDate, startMinDate]);

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
      setCreatives(results.filter((obj: CreativeProps) => !!obj.name));
      setLoading(false);
    };
    getCreatives();
  }, []);

  const transformPayloadData = (data: LineItemFormInputs) => {
    const { startDate, endDate, budget } = data;
    const payload = {
      startDateTime: {
        date: {
          year: startDate?.getUTCFullYear(),
          month: startDate?.getUTCMonth(),
          day: startDate?.getUTCDate(),
        },
        hour: startDate?.getUTCHours(),
        minute: startDate?.getUTCMinutes(),
        second: startDate?.getUTCSeconds(),
        timeZoneId: 'Asia/Kolkata',
      },
      endDateTime: {
        date: {
          year: endDate?.getUTCFullYear(),
          month: endDate?.getUTCMonth(),
          day: endDate?.getUTCDate(),
        },
        hour: endDate?.getUTCHours(),
        minute: endDate?.getUTCMinutes(),
        second: endDate?.getUTCSeconds(),
        timeZoneId: 'Asia/Kolkata',
      },
      costPerUnit: {
        currencyCode: 'INR',
        microAmount: budget * 1000000,
      },
      targeting: {
        inventoryTargeting: {
          targetedAdUnits: [
            {
              adUnitId: '22036727976',
              includeDescendants: true,
            },
          ],
        },
      },
    };
    return data;
  };

  const handleFormSubmit: SubmitHandler<LineItemFormInputs> = (data) => {
    // setNextStep((step) => step + 1);
    const payload = transformPayloadData(data);
    console.log(payload);
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5">Line Item</Typography>
      </Box>
      <Divider />
      <Box component="form" id="line-item-form" noValidate onSubmit={handleSubmit(handleFormSubmit)} sx={{ my: 3 }}>
        <Grid container spacing={4}>
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
                      minDate={startMinDate}
                      label="Start Date"
                      inputFormat="dd/MM/yyyy"
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
                      minDate={endMinDate}
                      label="End Date"
                      inputFormat="dd/MM/yyyy"
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

// LineItem.onSubmit = () => ({});

export default LineItem;
