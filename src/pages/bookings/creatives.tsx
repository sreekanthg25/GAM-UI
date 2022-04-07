import React, { FC, useState, useEffect, useMemo } from 'react';
import { useRecoilValue, useSetRecoilState } from 'Recoil';
import { useForm, Controller, SubmitHandler, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

/* Material UI */
import {
  Grid,
  Box,
  Typography,
  Divider,
  Autocomplete,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
  Stack,
  FormHelperText,
  Button,
  Select,
  MenuItem,
  ListSubheader,
  FormControl,
  InputLabel,
} from '@mui/material';

import { SelectChangeEvent } from '@mui/material/Select';

import { ExpandMore, Info as InfoIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import { formStep, formSaving, stepCompleted, lineItemId, lineItemInfo } from '@/recoil/atoms/bookingform';
import { configsSelector } from '@/recoil/selectors/configs';

import api from '@/utils/api';

import {
  CreativeFormTypes,
  CreativeProps,
  ImageType,
  TemplateVar,
  CreativeValidatorType,
  FileTypes,
} from '@/common/formTypes';
import { transformCreativesPayload, validateCreativeSizes } from '@/common/formMethods';

import { DropFiles } from '@/components';

const acceptFiles = [
  'image/*',
  'application/zip',
  'application/x-zip-compressed',
  'multipart/x-zip',
  'application/rar',
  'multipart/x-rar',
  'application/x-rar',
];

const schema = yup.object().shape({
  template: yup.object().required(),
  files: yup
    .mixed()
    .test('required', 'this field is required', (value) => !!value?.length)
    .test('type', `Please check the format and upload again`, (value: FileTypes[]) => {
      return !value.some(({ file }) => {
        const pattern = new RegExp(acceptFiles.join('|'));
        return !pattern.test(file.type);
      });
    }),
});

const FieldSetWrapper = styled('fieldset')(({ theme }) => {
  return {
    borderRadius: theme.shape.borderRadius,
    border: '1px solid',
    fontSize: theme.typography.caption.fontSize,
    borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
  };
});

const Creatives: FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    register,
    setValue,
    trigger,
  } = useForm<CreativeFormTypes>({
    defaultValues: { template: null, creatives: [], globalCreatives: {}, globalVariableConfig: {}, files: [] },
    resolver: yupResolver(schema),
  });
  const [templates, setTemplates] = useState([]);
  const [templateMetaVariables, setTemplateVariables] = useState<TemplateVar[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const gpLineItemId = useRecoilValue(lineItemId);
  const setNextStep = useSetRecoilState(formStep);
  const setFormSavingState = useSetRecoilState(formSaving);
  const setStepCompletion = useSetRecoilState(stepCompleted(2));
  const [isSettingsEnabled, setSettingsAction] = useState(false);
  const [uploadedImages, setImagesUploaded] = useState<ImageType[]>([]);
  const [fileMap, setFileMap] = useState<Record<string, string | ImageType[]>[]>([]);
  const [isSettingsStep, setSettingStep] = useState(false);
  const globalConfigs = useRecoilValue(configsSelector);
  const [creativeDimensions, setDimensions] = useState<TemplateVar[]>([]);
  const [creativeSizeErrors, setErrors] = useState<CreativeValidatorType['errors']>([]);
  const lineItemDetails = useRecoilValue(lineItemInfo);

  // console.log(errors);

  const { fields } = useFieldArray({
    control,
    name: 'creatives',
    keyName: 'uuid',
  });

  const [selectedTemplate, imageCreatives, globalCreatives, globalVariableConfig, uploadedFiles] = watch([
    'template',
    'creatives',
    'globalCreatives',
    'globalVariableConfig',
    'files',
  ]);
  // console.log(fields);

  const lineItemCreativeSizes = useMemo(() => {
    if (!lineItemDetails) {
      return [];
    }
    const { creative_placeholders = [] } = lineItemDetails;
    return creative_placeholders.reduce((acc, creative) => {
      const {
        type,
        size: { width, height },
      } = creative;
      if (type !== 'NATIVE') {
        acc.push(`${width}x${height}`);
      }
      return acc;
    }, [] as string[]);
  }, [lineItemDetails]);

  useEffect(() => {
    const getTemplates = async () => {
      setLoading(true);
      const results = await api.get('/basilisk/v0/creativetemplates');
      setTemplates(results.filter((obj: CreativeProps) => !!obj.name));
      setLoading(false);
    };
    getTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      setValue('files', []);
      const getTemplateMeta = async () => {
        setTemplateLoading(true);
        const results = await api.get(`/basilisk/v0/creativetemplate/${selectedTemplate.id}`);
        setTemplateVariables([
          ...(selectedTemplate.type === 'SYSTEM_DEFINED_NATIVE'
            ? [{ label: 'Landing Page', unique_name: 'dest_url', is_required: true, type: 'NATIVE_URL' }]
            : []),
          ...results.variables,
        ]);
        setDimensions(
          results.variables.filter(
            (variable: { unique_name: string }) =>
              variable.unique_name === 'Width' || variable.unique_name === 'Height',
          ),
        );
        setTemplateLoading(false);
      };
      getTemplateMeta();
    }
  }, [selectedTemplate, setTemplateVariables, setValue]);

  useEffect(() => {
    const defaultVariables = templateMetaVariables.reduce(
      (acc, { unique_name }) => {
        acc['creativeVariables'][unique_name] = '';
        acc['configVariables'][unique_name] = 'none';
        return acc;
      },
      { creativeVariables: {}, configVariables: {} } as Record<string, Record<string, string>>,
    );
    setValue('globalCreatives', defaultVariables.creativeVariables);
    setValue('globalVariableConfig', defaultVariables.configVariables);
  }, [templateMetaVariables, setValue]);

  const handleFormSubmit: SubmitHandler<CreativeFormTypes> = async ({ template, creatives }) => {
    try {
      const { errors: validationResults } = validateCreativeSizes(creatives, lineItemCreativeSizes);
      setErrors(validationResults);
      if (validationResults) {
        return;
      }
      setFormSavingState(true);

      const template_id = (template as CreativeProps).id;
      const payload = {
        gp_lineitem_id: gpLineItemId,
        template_id,
        creatives: transformCreativesPayload(creatives, templateMetaVariables),
      };
      await api.post('/basilisk/v0/bulkcreative', payload);
      setNextStep((step) => step + 1);
      setFormSavingState(false);
      setStepCompletion(true);
    } catch (err) {
      const { error } = err as { error: string };
      setFormSavingState(false);
      console.log(error);
    }
  };

  const setCreativesDefaultValues = () => {
    const filesArr = fileMap.reduce((acc, obj) => [...acc, ...(obj.files as ImageType[])], [] as ImageType[]);
    const defaultCreatives = filesArr.map((image) => {
      const [name] = image.name.split('.');
      const variables = templateMetaVariables.reduce((acc, { unique_name }) => {
        if (unique_name === 'Image') {
          acc[unique_name] = image;
        } else if (unique_name === 'Width') {
          acc[unique_name] = image.image_meta.width;
        } else if (unique_name === 'Height') {
          acc[unique_name] = image.image_meta.height;
        } else {
          acc[unique_name] = globalCreatives[unique_name] ?? ``;
        }

        return acc;
      }, {} as Record<string, string | ImageType | number>);
      return {
        id: image.id,
        name,
        ...variables,
      };
    });
    setImagesUploaded(filesArr);
    setValue('creatives', defaultCreatives);
  };

  const handleNext = async () => {
    const isValid = await trigger(['files']);
    if (isValid) {
      setCreativesDefaultValues();
      setSettingStep(true);
    }
  };

  const onDropFiles = (fileToUpload: FileTypes[]) => {
    if (!fileToUpload.length) {
      return;
    }
    const uploadFiles = async () => {
      setImageUploading(true);

      const promises = fileToUpload.map((file: FileTypes) => {
        const formData = new FormData();
        formData.append('files', file.file);
        return api.post('/basilisk/v0/media/upload', formData, {
          formData: true,
        });
      });
      const results = await Promise.allSettled(promises);
      let fulfilledImages: ImageType[] = [];
      const fileUploaded: FileTypes[] = [];
      const successFileMaps = results.reduce((acc, obj, idx) => {
        if (obj.status === 'fulfilled') {
          const { id } = fileToUpload[idx];
          acc.push({ id, files: obj.value });
          fileUploaded.push(fileToUpload[idx]);
          fulfilledImages = [...fulfilledImages, ...obj.value];
        }
        return acc;
      }, [] as Record<string, string | ImageType[]>[]);
      setValue('files', [...uploadedFiles, ...fileUploaded]);
      setFileMap([...fileMap, ...successFileMaps]);
      setSettingsAction(true);
      setImageUploading(false);
    };
    uploadFiles();
  };

  const onDeleteFile = (file: FileTypes) => {
    setValue(
      'files',
      uploadedFiles.filter((item: FileTypes) => file.id !== item.id),
    );
    setFileMap(fileMap.filter((f) => f.id !== file.id));
  };

  const handleConfigChange = (e: SelectChangeEvent, name: string) => {
    const { value } = e.target;
    setValue(`globalCreatives.${name}`, value !== 'none' ? value : '');
  };

  const uploadView = () => {
    return (
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Controller
            control={control}
            name="template"
            render={({ field }) => (
              <Autocomplete
                {...field}
                loading={loading}
                filterSelectedOptions
                options={templates}
                getOptionLabel={(option) => option.name}
                onChange={(_, data) => field.onChange(data)}
                isOptionEqualToValue={(option, value) => {
                  // console.log(option, value);
                  return option.id === value.id;
                }}
                renderInput={(params) => (
                  <TextField required error={!!errors.template} label="Select Template" {...params} />
                )}
              />
            )}
          />
        </Grid>
        {selectedTemplate && (
          <>
            <Grid item xs={12}>
              <DropFiles
                {...register('files')}
                onDropFiles={onDropFiles}
                accept={acceptFiles}
                files={uploadedFiles}
                onDelete={onDeleteFile}
                loading={imageUploading}
              />
              <FormHelperText error={!!errors.files}>
                {errors.files ? `Please upload files in recommended formats` : null}
              </FormHelperText>
            </Grid>

            <Grid item xs={12}>
              {templateLoading ? (
                <Stack>
                  <Skeleton />
                  <Skeleton />
                  <Skeleton />
                </Stack>
              ) : (
                <Stack>
                  {templateMetaVariables.map(({ unique_name, label, type }) =>
                    type !== 'Asset' && type !== 'Long' ? (
                      <Accordion key={unique_name}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography>{label}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container item spacing={4} key={unique_name}>
                            {type === 'Url' ? (
                              <Grid item md={4}>
                                <FormControl fullWidth>
                                  <InputLabel id="config-label">Select Config key</InputLabel>
                                  <Controller
                                    control={control}
                                    name={`globalVariableConfig.${unique_name}`}
                                    render={({ field }) => (
                                      <Select
                                        {...field}
                                        label="Select Config key"
                                        defaultValue="none"
                                        labelId="config-label"
                                        onChange={(e) => {
                                          field.onChange(e);
                                          handleConfigChange(e, unique_name);
                                        }}
                                      >
                                        <MenuItem value="none">None</MenuItem>
                                        {globalConfigs.map(
                                          (config: { bucket_name: string; kv_pairs: Record<string, string>[] }) => [
                                            <ListSubheader key={config.bucket_name}>
                                              {config.bucket_name}
                                            </ListSubheader>,
                                            config.kv_pairs.map((kv, kvIdx: number) => (
                                              <MenuItem key={`${kv.key}_${kvIdx}`} value={`${kv.value}`}>
                                                {kv.key}
                                              </MenuItem>
                                            )),
                                          ],
                                        )}
                                      </Select>
                                    )}
                                  />
                                </FormControl>
                              </Grid>
                            ) : null}
                            <Grid item sx={{ flex: 1 }}>
                              <Controller
                                control={control}
                                name={`globalCreatives.${unique_name}`}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    disabled={globalVariableConfig[unique_name] !== 'none'}
                                    fullWidth
                                    placeholder={`Enter ${label}`}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    ) : null,
                  )}
                </Stack>
              )}
            </Grid>
            {isSettingsEnabled && (
              <Box sx={{ p: 2 }}>
                <Button variant="contained" color="primary" sx={{ ml: 3 }} onClick={handleNext}>
                  Continue
                </Button>
              </Box>
            )}
          </>
        )}
      </Grid>
    );
  };

  const settingsView = () => {
    return (
      <Box sx={{ p: 1 }}>
        {fields.map((fld, idx) => (
          <Accordion defaultExpanded={idx === 0} key={fld.uuid}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>{imageCreatives[idx].name}</Typography>
              {creativeSizeErrors?.[idx] && <InfoIcon color="error" fontSize="small" sx={{ ml: 2 }} />}
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={4}>
                <Grid item md={10}>
                  <Controller
                    control={control}
                    name={`creatives.${idx}.name`}
                    render={({ field }) => <TextField {...field} variant="outlined" label="Name" required fullWidth />}
                  />
                </Grid>
                <Grid item md={10}>
                  <Box component={FieldSetWrapper} sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <legend>
                      <span>Image</span>
                    </legend>
                    <img src={uploadedImages[idx].url} height={40} />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                      {uploadedImages[idx].name}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item container spacing={4}>
                  {templateMetaVariables.map(({ unique_name, label, type, is_required }) => {
                    return type !== 'Asset' && type !== 'Long' ? (
                      <Grid key={unique_name} item md={8}>
                        <Controller
                          control={control}
                          name={`creatives.${idx}.${unique_name}`}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              key={unique_name}
                              variant="outlined"
                              required={is_required}
                              label={label}
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                    ) : null;
                  })}
                  {creativeDimensions.length && (
                    <Grid item xs={12}>
                      <Grid container spacing={4}>
                        {creativeDimensions.map(({ unique_name, label, is_required }) => {
                          return (
                            <Grid item key={unique_name} md={4}>
                              <Controller
                                control={control}
                                name={`creatives.${idx}.${unique_name}`}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    variant="outlined"
                                    required={is_required}
                                    label={label}
                                    fullWidth
                                  />
                                )}
                              />
                            </Grid>
                          );
                        })}
                      </Grid>
                      {creativeSizeErrors?.[idx] && (
                        <FormHelperText error={creativeSizeErrors?.[idx]}>Creative sizes mismatch</FormHelperText>
                      )}
                      <FormHelperText>{`The supported creative sizes for this line item: ${lineItemCreativeSizes.join(
                        ', ',
                      )}`}</FormHelperText>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5">Creatives</Typography>
      </Box>
      <Divider />
      <Box component="form" id="creative-form" sx={{ my: 3 }} noValidate onSubmit={handleSubmit(handleFormSubmit)}>
        {isSettingsStep ? settingsView() : uploadView()}
      </Box>
    </Box>
  );
};

export default Creatives;
