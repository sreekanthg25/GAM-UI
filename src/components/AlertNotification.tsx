import React, { FC } from 'react';

import { Snackbar, Alert, AlertTitle, AlertProps } from '@mui/material';

type NotificationTypes = FC & {
  title: string;
  message: string;
  open?: boolean;
  type?: AlertProps['severity'];
  onClose?: AlertProps['onClose'];
};

const AlertNotification: FC<NotificationTypes> = (props: NotificationTypes) => {
  const { message, title, onClose, open, type } = props;
  return (
    <Snackbar open={open} anchorOrigin={{ horizontal: 'right', vertical: 'top' }}>
      <Alert severity={type} variant="filled" onClose={onClose}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AlertNotification;
