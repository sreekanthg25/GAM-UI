import React, { FC } from 'react';
import { useLocation, useParams, Link as RouteLink } from 'react-router-dom';

import { Box, Typography, Divider, Button, TextField, Grid } from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { useRecoilValue } from 'Recoil';

import { useForm, Controller /*  SubmitHandler, useFieldArray  */ } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { getCreative } from '@/recoil/selectors/creatives';

const schema = yup.object().shape({ creative: yup.object().shape({ creative_name: yup.string().required() }) });

type ParamTypes = { cid: string };
const CreativeEdit: FC = () => {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const { cid } = useParams<ParamTypes>();
  const lineItemId = queryParams.get('lid');
  const orderId = queryParams.get('oid');
  const creative = useRecoilValue(getCreative(cid));
  console.log(creative.creative_data.creative_name);
  const {
    control,
    formState: { errors },
  } = useForm({ defaultValues: { creative: creative.creative_data }, resolver: yupResolver(schema) });
  console.log(errors);

  const renderForm = () => {
    return (
      <Grid container spacing={4}>
        <Grid item md={4}>
          <Controller
            control={control}
            name={`creative.creative_name`}
            render={({ field }) => <TextField {...field} variant="outlined" label="Name" required fullWidth />}
          />
        </Grid>
      </Grid>
    );
  };

  const renderFooter = () => {
    return (
      <Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            component={RouteLink}
            to={{ pathname: `/line-item/${lineItemId}`, search: orderId ? `?oid=${orderId}` : '' }}
          >
            Cancel
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LoadingButton form="creative-form" loading={false} variant="contained" type="submit">
              Submit
            </LoadingButton>
          </Box>
        </Box>
      </Box>
    );
  };
  return (
    <Box>
      <Box sx={{ py: 5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant="h4">Edit Creative</Typography>
        </Box>
        <Divider sx={{ mt: 2 }} />
      </Box>
      {renderForm()}
      {renderFooter()}
    </Box>
  );
};

export default CreativeEdit;
