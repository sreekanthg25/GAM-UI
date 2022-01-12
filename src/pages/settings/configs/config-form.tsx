import React, { FC, useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useSetRecoilState } from 'Recoil';

import { Grid, Box, Typography, Divider, Button, TextField, IconButton, CircularProgress } from '@mui/material';
import { AddCircleRounded, DeleteRounded } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

import { useForm, Controller, SubmitHandler, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { refreshConfigs } from '@/recoil/atoms/configs';

import api from '@/utils/api';

const variablesLimit = 1;

const defaultVariable = { key: '', value: '' };

const schema = yup.object().shape({
  bucket_name: yup.string().required(),
  variables: yup.array().of(
    yup.object().shape({
      key: yup.string().required(),
      value: yup.string().required(),
    }),
  ),
});

type ConfigTypes = {
  bucket_name: string;
  variables: Record<string, string>[];
};

const ConfigForm: FC = () => {
  const [isSubmitting, setSubmitStatus] = useState(false);
  const [isFetching, setFetchingStatus] = useState(false);
  const setConfigRefresh = useSetRecoilState(refreshConfigs);
  const history = useHistory();
  const { configName } = useParams<Record<string, string>>();
  const isEdit = !!configName;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { bucket_name: '', variables: [defaultVariable] },
    resolver: yupResolver(schema),
  });

  console.log(errors);

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'variables',
  });

  useEffect(() => {
    if (configName) {
      const fetchConfig = async () => {
        setFetchingStatus(true);
        const results = await api.get(`http://35.200.238.164:9000/basilisk/v0/account/metadata/keys/${configName}`);
        const { bucket_name, kv_pairs } = results?.[0] || {};
        replace(kv_pairs);
        setValue('bucket_name', bucket_name);
        setFetchingStatus(false);
      };
      fetchConfig();
    }
  }, [configName, replace, setValue]);

  const handleCancel = () => {
    history.push('/settings/configs');
  };

  const onAddAction = () => {
    append(defaultVariable);
  };

  const onDeleteAction = (idx: number) => {
    remove(idx);
  };

  const handleFormSubmit: SubmitHandler<ConfigTypes> = async ({ bucket_name, variables }) => {
    setSubmitStatus(true);
    const payload = {
      bucket_name,
      kv_pairs: variables,
    };
    await api.post('http://35.200.238.164:9000/basilisk/v0/account/metadata', payload);
    setConfigRefresh((currVal) => currVal + 1);
    setSubmitStatus(false);
    handleCancel();
  };

  const renderVariables = () => {
    return (
      <>
        {fields.map((variable, idx) => {
          const variablesLength = fields.length;
          const showAddAction = idx === variablesLength - 1;
          const showDeleteAction = variablesLength > variablesLimit;
          return (
            <Grid container key={variable.id} item spacing={4}>
              <Grid item md={4}>
                <Controller
                  control={control}
                  name={`variables.${idx}.key`}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      error={!!errors?.variables?.[idx]?.key}
                      required
                      label="Variable Name"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item md={5}>
                <Controller
                  control={control}
                  name={`variables.${idx}.value`}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      error={!!errors?.variables?.[idx]?.value}
                      required
                      label="Variable Value"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item md={3}>
                <Box sx={{ display: 'flex', height: '100%', alignItems: 'center' }}>
                  {showDeleteAction ? (
                    <IconButton onClick={() => onDeleteAction(idx)}>
                      <DeleteRounded fontSize="large" />
                    </IconButton>
                  ) : null}
                  {showAddAction ? (
                    <IconButton onClick={onAddAction}>
                      <AddCircleRounded color="primary" fontSize="large" />
                    </IconButton>
                  ) : null}
                </Box>
              </Grid>
            </Grid>
          );
        })}
      </>
    );
  };
  const renderForm = () => {
    return (
      <Grid container spacing={4}>
        <Grid item md={4}>
          <Controller
            name="bucket_name"
            control={control}
            render={({ field }) => (
              <TextField {...field} disabled={isEdit} error={!!errors.bucket_name} required fullWidth label="Name" />
            )}
          />
        </Grid>
        <Grid container item xs={12} spacing={4}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex' }}>
              <Typography component="h6">Variables</Typography>
            </Box>
            <Divider sx={{ mt: 1 }} />
          </Grid>
          {renderVariables()}
        </Grid>
      </Grid>
    );
  };
  const renderFooter = () => {
    return (
      <Box sx={{ display: 'flex', mt: 4, justifyContent: 'flex-end' }}>
        <Button sx={{ mr: 4 }} onClick={handleCancel}>
          Cancel
        </Button>
        <LoadingButton loading={isSubmitting} variant="contained" type="submit">
          {isEdit ? 'Update' : 'Create'}
        </LoadingButton>
      </Box>
    );
  };
  return isFetching ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
      <CircularProgress />
    </Box>
  ) : (
    <Box sx={{ py: 5, px: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Typography variant="h5">{isEdit ? 'Edit Config' : 'Create Config'}</Typography>
      </Box>
      <Divider sx={{ mt: 2 }} />
      <Box component="form" id="config-form" sx={{ my: 3 }} noValidate onSubmit={handleSubmit(handleFormSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {renderForm()}
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ mt: 2 }} />
            {renderFooter()}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ConfigForm;
