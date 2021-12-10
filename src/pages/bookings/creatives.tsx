import React, { FC, useState, useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'Recoil';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
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
  Table,
  TableCell,
  TableRow,
  TableHead,
  TableBody,
  Skeleton,
  Stack,
  Chip,
  FormHelperText,
} from '@mui/material';
import { blue } from '@mui/material/colors';
import { LoadingButton } from '@mui/lab';
import { UploadFileOutlined, ExpandMore } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import { formStep, formSaving, stepCompleted, lineItemId } from '@/recoil/atoms/bookingform';

import api from '@/utils/api';

import { CreativeFormTypes, CreativeProps } from './formTypes';

const FileInput = styled('input')({
  display: 'none',
});
const supportedCSVFileMimeTypes = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

const supportedZipFileMimeTypes = ['application/zip', 'application/x-zip-compressed', 'multipart/x-zip'];

const schema = yup.object().shape({
  template: yup.object().required(),
  csv_file: yup
    .mixed()
    .test('required', 'this field is required', (value) => !!value?.length)
    .test('type', `Please check the format and upload again`, (value) => {
      const files: File[] = Array.from(value || []);
      return !files.some((file: File) => {
        return !supportedCSVFileMimeTypes.includes(file.type);
      });
    }),
  zip_file: yup.mixed().test('type', `Please check the format and upload again`, (value) => {
    const files: File[] = Array.from(value || []);
    return !files.some((file: File) => {
      return !supportedZipFileMimeTypes.includes(file.type);
    });
  }),
});

type TemplateVar = {
  is_required: boolean;
  unique_name: string;
  type: string;
};

const Creatives: FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    register,
    setValue,
  } = useForm<CreativeFormTypes>({
    defaultValues: { template: null },
    resolver: yupResolver(schema),
  });
  const [templates, setTemplates] = useState([]);
  const [templateMetaVariables, setTemplateVariables] = useState<TemplateVar[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const gpLineItemId = useRecoilValue(lineItemId);
  const setNextStep = useSetRecoilState(formStep);
  const setFormSavingState = useSetRecoilState(formSaving);
  const setStepCompletion = useSetRecoilState(stepCompleted(2));

  const [selectedTemplate, uploadedFile, uploadedZipFile] = watch(['template', 'csv_file', 'zip_file']);

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
      setValue('csv_file', null);
      setValue('zip_file', null);
      const getTemplateMeta = async () => {
        setTemplateLoading(true);
        const results = await api.get(`http://35.200.238.164:9000/basilisk/v0/creativetemplate/${selectedTemplate.id}`);
        setTemplateVariables([
          { unique_name: 'Creative Name', is_required: true, type: 'String' },
          ...(selectedTemplate.type !== 'SYSTEM_DEFINED_NATIVE'
            ? [{ unique_name: 'Landing Page', is_required: true, type: 'Url' }]
            : []),
          ...results.variables,
        ]);
        setTemplateLoading(false);
      };
      getTemplateMeta();
    }
  }, [selectedTemplate, setTemplateVariables, setValue]);

  const handleFormSubmit: SubmitHandler<CreativeFormTypes> = async ({ template, csv_file, zip_file }) => {
    try {
      setFormSavingState(true);
      const files = Array.from(csv_file || []);
      const zip = Array.from(zip_file || []);
      const template_id = (template as CreativeProps).id;
      const formData = new FormData();
      formData.append('template_id', template_id.toString());
      formData.append('csv_file', files[0]);
      formData.append('zip_file', zip[0]);
      formData.append('gp_lineitem_id', gpLineItemId);
      await api.post('http://35.200.238.164:9000/basilisk/v0/bulkcreative', formData, { formData: true });
      setNextStep((step) => step + 1);
      setFormSavingState(false);
      setStepCompletion(true);
    } catch (err) {
      const { error } = err as { error: string };
      setFormSavingState(false);
      console.log(error);
    }
  };

  const renderFileData = (uploads: FileList | null | undefined, field: 'csv_file' | 'zip_file'): React.ReactNode => {
    const files: File[] = Array.from(uploads || []);
    if (files.length) {
      return files.map((file, index) => (
        <Chip
          key={`${file.name}_${index}`}
          label={file.name}
          onDelete={() => {
            setValue(field, null);
          }}
        />
      ));
    }

    return <Typography>No file chosen*</Typography>;
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5">Creatives</Typography>
      </Box>
      <Divider />
      <Box component="form" id="creative-form" sx={{ my: 3 }} noValidate onSubmit={handleSubmit(handleFormSubmit)}>
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
                  <label htmlFor="file-upload">
                    <FileInput
                      {...register('csv_file')}
                      id="file-upload"
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      type="file"
                    />
                    <LoadingButton
                      variant="outlined"
                      component="span"
                      endIcon={<UploadFileOutlined />}
                      color={errors.csv_file ? 'error' : 'secondary'}
                    >
                      Upload CSV File
                    </LoadingButton>
                  </label>
                  <Box component="span" sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                    {renderFileData(uploadedFile, 'csv_file')}
                  </Box>
                </Stack>
                <FormHelperText error={!!errors.csv_file}>{errors.csv_file?.message}</FormHelperText>
              </Grid>
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
              <Grid item xs={12}>
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>CSV Format Info</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {templateLoading ? (
                      <Stack>
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                      </Stack>
                    ) : (
                      <Stack>
                        <Box>
                          <Typography variant="body2">The CSV order and format must be as below format</Typography>
                          <Typography variant="body2" sx={{ color: blue[600] }}>
                            {templateMetaVariables.map(({ unique_name }) => unique_name).join(', ')}
                          </Typography>
                        </Box>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Type</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {templateMetaVariables.map(({ unique_name, type, is_required }) => (
                              <TableRow key={unique_name}>
                                <TableCell>
                                  {unique_name} {is_required && <>*</>}
                                </TableCell>
                                <TableCell>{type}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Stack>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default Creatives;
