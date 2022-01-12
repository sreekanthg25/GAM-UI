import React, { FC, useEffect, useState, useMemo } from 'react';
import { useLocation, Link as RouteLink, useHistory } from 'react-router-dom';

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
  Chip,
  FormHelperText,
  Button,
  Select,
  MenuItem,
  ListSubheader,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { UploadFileOutlined, ExpandMore, Info as InfoIcon } from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material/Select';

import { styled } from '@mui/material/styles';

import api from '@/utils/api';

import { configsSelector } from '@/recoil/selectors/configs';

import { refreshLineItems } from '@/recoil/atoms/lineitems';

import { CreativeFormTypes, CreativeProps, TemplateVar, ImageType, CreativeValidatorType } from '@/common/formTypes';
import { transformCreativesPayload, validateCreativeSizes } from '@/common/formMethods';

const supportedZipFileMimeTypes = ['application/zip', 'application/x-zip-compressed', 'multipart/x-zip'];

const schema = yup.object().shape({
  template: yup.object().required(),
  zip_file: yup
    .mixed()
    .test('required', 'this field is required', (value) => !!value?.length)
    .test('type', `Please check the format and upload again`, (value) => {
      const files: File[] = Array.from(value || []);
      return !files.some((file: File) => {
        return !supportedZipFileMimeTypes.includes(file.type);
      });
    }),
});

const FileInput = styled('input')({
  display: 'none',
});

const FieldSetWrapper = styled('fieldset')(({ theme }) => {
  return {
    borderRadius: theme.shape.borderRadius,
    border: '1px solid',
    fontSize: theme.typography.caption.fontSize,
    borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
  };
});

const CreativesForm: FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    register,
    setValue,
  } = useForm<CreativeFormTypes>({
    defaultValues: { template: null, creatives: [], globalCreatives: {}, globalVariableConfig: {} },
    resolver: yupResolver(schema),
  });

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const lineItemId = queryParams.get('lid');
  const orderId = queryParams.get('oid');
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateMetaVariables, setTemplateVariables] = useState<TemplateVar[]>([]);
  const [creativeDimensions, setDimensions] = useState<TemplateVar[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadedImages, setImagesUploaded] = useState<ImageType[]>([]);
  const [isSettingsEnabled, setSettingsAction] = useState(false);
  const [isSettingsStep, setSettingStep] = useState(false);
  const [lineItemDetails, setLineItemDetails] = useState<Record<string, string | CreativeProps[]> | null>(null);
  const [isFormSaving, setFormSavingState] = useState(false);
  const globalConfigs = useRecoilValue(configsSelector);
  const [creativeSizeErrors, setErrors] = useState<CreativeValidatorType['errors']>([]);

  const [notification, setNotification] = useState(false);

  const history = useHistory();

  const lineItemCreativeSizes = useMemo(() => {
    if (!lineItemDetails) {
      return [];
    }
    const { creative_placeholders = [] } = lineItemDetails as Record<string, CreativeProps[]>;
    return creative_placeholders.reduce((acc, creative) => {
      const {
        creative_type,
        size: { width, height },
      } = creative;
      if (creative_type !== 'NATIVE') {
        acc.push(`${width}x${height}`);
      }
      return acc;
    }, [] as string[]);
  }, [lineItemDetails]);

  const lineItemRefresh = useSetRecoilState(refreshLineItems);

  const { fields } = useFieldArray({
    control,
    name: 'creatives',
    keyName: 'uuid',
  });

  const [selectedTemplate, uploadedZipFile, imageCreatives, globalCreatives, globalVariableConfig] = watch([
    'template',
    'zip_file',
    'creatives',
    'globalCreatives',
    'globalVariableConfig',
  ]);

  useEffect(() => {
    if (lineItemId) {
      const getLineItemDetails = async () => {
        const results = await api.get(`http://35.200.238.164:9000/basilisk/v0/lineitem/${lineItemId}`);
        setLineItemDetails(results?.gp_line_item || null);
      };
      getLineItemDetails();
    }
  }, [lineItemId]);

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

  useEffect(() => {
    const getTemplates = async () => {
      setLoading(true);
      const results = await api.get('http://35.200.238.164:9000/basilisk/v0/creativetemplates');
      setTemplates(results.filter((obj: CreativeProps) => !!obj.name));
      setLoading(false);
    };
    getTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      setValue('zip_file', null);
      const getTemplateMeta = async () => {
        setTemplateLoading(true);
        const results = await api.get(`http://35.200.238.164:9000/basilisk/v0/creativetemplate/${selectedTemplate.id}`);
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
    if (uploadedZipFile) {
      const uploadImages = async () => {
        setImageUploading(true);
        const imageZip = uploadedZipFile as FileList;
        const zip = Array.from(imageZip || []);
        const formData = new FormData();
        formData.append('zip_file', zip[0]);
        const results = await api.post('http://35.200.238.164:9000/basilisk/v0/media/upload', formData, {
          formData: true,
        });
        setImagesUploaded(results);
        setSettingsAction(true);
        setImageUploading(false);
      };
      uploadImages();
    }
  }, [uploadedZipFile]);

  const setCreativesDefaultValues = () => {
    const defaultCreatives = uploadedImages.map((image) => {
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
    setValue('creatives', defaultCreatives);
  };

  const handleNext = () => {
    setCreativesDefaultValues();
    setSettingStep(true);
  };

  const onSuccessfulSubmission = () => {
    lineItemRefresh((curVal) => curVal + 1);
    setNotification(true);
  };

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
        gp_lineitem_id: lineItemId,
        template_id,
        creatives: transformCreativesPayload(creatives, templateMetaVariables),
      };
      await api.post('http://35.200.238.164:9000/basilisk/v0/bulkcreative', payload);
      onSuccessfulSubmission();
      setFormSavingState(false);
    } catch (err) {
      const { error } = err as { error: string };
      setFormSavingState(false);
      console.log(error);
    }
  };

  const handleConfigChange = (e: SelectChangeEvent, name: string) => {
    const { value } = e.target;
    setValue(`globalCreatives.${name}`, value !== 'none' ? value : '');
  };

  const renderFileData = (uploads: FileList | null | undefined, field: 'zip_file'): React.ReactNode => {
    const files: File[] = Array.from(uploads || []);
    if (files.length) {
      return !imageUploading
        ? files.map((file, index) => (
            <Chip
              key={`${file.name}_${index}`}
              label={file.name}
              onDelete={() => {
                setValue(field, null);
              }}
            />
          ))
        : null;
    }

    return <Typography>No file chosen*</Typography>;
  };

  const uploadView = () => {
    return (
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
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
              <Stack direction="row">
                <label htmlFor="zip-file-upload">
                  <FileInput
                    {...register('zip_file')}
                    id="zip-file-upload"
                    accept="application/zip, application/x-zip-compressed, multipart/x-zip"
                    type="file"
                  />
                  <LoadingButton
                    loading={imageUploading}
                    loadingPosition="end"
                    variant="outlined"
                    component="span"
                    endIcon={<UploadFileOutlined />}
                    color={errors.zip_file ? 'error' : 'secondary'}
                  >
                    Upload Image Zip File
                  </LoadingButton>
                </label>
                <Box component="span" sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                  {renderFileData(uploadedZipFile, 'zip_file')}
                </Box>
              </Stack>
              <FormHelperText error={!!errors.zip_file}>{errors.zip_file?.message}</FormHelperText>
              <FormHelperText>Upload compressed images in zip format.</FormHelperText>
            </Grid>
            <Grid item md={8}>
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
                <Grid item md={8}>
                  <Controller
                    control={control}
                    name={`creatives.${idx}.name`}
                    render={({ field }) => <TextField {...field} variant="outlined" label="Name" required fullWidth />}
                  />
                </Grid>
                <Grid item md={8}>
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
                            <TextField {...field} variant="outlined" required={is_required} label={label} fullWidth />
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
                      {lineItemCreativeSizes.length ? (
                        <FormHelperText>{`The supported creative sizes for this line item: ${lineItemCreativeSizes.join(
                          ', ',
                        )}`}</FormHelperText>
                      ) : null}
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

  const renderBody = () => {
    return (
      <Box sx={{ py: 3 }} component="form" id="creative-form" noValidate onSubmit={handleSubmit(handleFormSubmit)}>
        {isSettingsStep ? settingsView() : uploadView()}
      </Box>
    );
  };

  const handleDialogClose = () => {
    setNotification(false);
    history.push(`/line-item${orderId ? `?oid=${orderId}` : ''}`);
  };

  const renderSuccessDialog = () => {
    return notification ? (
      <Dialog open={true}>
        <DialogTitle>{`Creatives added successfully to line item: ${lineItemDetails?.name}`}</DialogTitle>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button color="success" variant="contained" onClick={handleDialogClose}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    ) : null;
  };

  const renderFooter = () => {
    return (
      <Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button component={RouteLink} to={{ pathname: '/line-item' }}>
            Cancel
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isSettingsStep && (
              <Button disabled={!isSettingsEnabled} variant="contained" onClick={handleNext}>
                Continue
              </Button>
            )}
            {isSettingsStep && (
              <LoadingButton form="creative-form" loading={isFormSaving} variant="contained" type="submit">
                Submit
              </LoadingButton>
            )}
          </Box>
        </Box>
      </Box>
    );
  };
  return (
    <Stack sx={{ py: 5, px: 3 }}>
      <Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant="h4">New Creatives</Typography>
        </Box>
        <Divider sx={{ mt: 2 }} />
      </Box>
      {renderBody()}
      {renderFooter()}
      {renderSuccessDialog()}
    </Stack>
  );
};
export default CreativesForm;
