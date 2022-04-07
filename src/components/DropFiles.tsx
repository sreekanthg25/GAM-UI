import React, { FC, forwardRef, useCallback } from 'react';
import { useDropzone, DropzoneProps } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';

import { Box, Paper, Typography, Button, Chip, CircularProgress } from '@mui/material';
import { FileTypes } from '@/common/formTypes';

interface DropFilesTypes extends DropzoneProps {
  files?: FileTypes[];
  onDelete?: (item: FileTypes, index: number) => void;
  loading?: boolean;
  onDropFiles: (files: FileTypes[]) => void;
}

const DropFiles: FC<DropFilesTypes> = forwardRef((props: DropFilesTypes, ref) => {
  const { onDropFiles, accept = '', onDelete, files = [], loading } = props;
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const filesUploaded: FileTypes[] = acceptedFiles.map((file) => {
        return { id: uuidv4(), file };
      });
      onDropFiles(filesUploaded);
    },
    [onDropFiles],
  );
  const { getRootProps, getInputProps } = useDropzone({
    accept,
    onDrop,
  });

  const renderFiles = () => {
    return files.map((item: FileTypes, index) => (
      <Chip
        sx={{ m: 1 }}
        key={`${item.id}`}
        label={item.file.name}
        onDelete={() => {
          onDelete && onDelete(item, index);
        }}
      />
    ));
  };

  const renderDragDrop = () => {
    return (
      <>
        <input {...getInputProps()} />
        <Typography variant="subtitle1">
          Drop files here or
          <Button variant="text" sx={{ '&:hover': { background: 'none' } }}>
            browse
          </Button>
        </Typography>
        <Typography variant="body2">GIF, JPG/JPEG, PNG, ZIP. Maximum of 50 files.</Typography>
      </>
    );
  };

  return (
    <Box ref={ref}>
      <Paper
        {...getRootProps()}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '96px',
          flexDirection: 'column',
        }}
      >
        {loading ? <CircularProgress /> : renderDragDrop()}
      </Paper>
      {renderFiles()}
    </Box>
  );
});

export default DropFiles;
