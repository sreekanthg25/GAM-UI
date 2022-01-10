import React, { FC } from 'react';

import { Snackbar, Alert, AlertTitle, AlertProps, SnackbarOrigin } from '@mui/material';

type NotificationTypes = FC & {
  title: string;
  message: string;
  open?: boolean;
  type?: AlertProps['severity'];
  onClose?: AlertProps['onClose'];
  anchorOrigin?: SnackbarOrigin;
};

const AlertNotification: FC<NotificationTypes> = (props: NotificationTypes) => {
  const { message, title, onClose, open, type, anchorOrigin = { horizontal: 'right', vertical: 'top' } } = props;
  return (
    <Snackbar open={open} anchorOrigin={anchorOrigin}>
      <Alert severity={type} variant="filled" onClose={onClose}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AlertNotification;
