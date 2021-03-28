import * as React from 'react';
import Box from '@material-ui/core/Box';
import { Alert as MuiAlert } from '@material-ui/core';
import { Alert as LabAlert } from '@material-ui/lab';
import AlertTitle from '@material-ui/core/AlertTitle';
import Collapse from '@material-ui/core/Collapse';

const Alert = ({
  danger,
  info,
  success,
  error,
  warning,
  message,
  description,
  closable,
  noclose,
  children,
  onClose,
  showIcon,
  title,
  open = true,
  ...props
}) => {
  const [alertopen, setAlertOpen] = React.useState(open);
  let type = 'info';

  if (info) {
    type = 'info';
  }
  if (danger || error) {
    type = 'error';
  }
  if (success) {
    type = 'success';
  }
  if (warning) {
    type = 'warning';
  }

  let closeProps = {
    onClose: () => {
      setAlertOpen(false);
      if (typeof onClose === 'function') {
        onClose();
      }
    },
  };

  if (!closable || noclose) {
    closeProps = {};
  }

  return (
    <Box
      sx={{
        width: '100%',
        '& > * + *': {
          mt: 2,
        },
      }}
    >
      <Collapse in={alertopen}>
        {MuiAlert ? (
          <MuiAlert severity={type} {...closeProps} {...props}>
            <AlertTitle>{`${title || type}`}</AlertTitle>
            {message || description || children}
          </MuiAlert>
        ) : (
          <LabAlert severity={type} {...closeProps} {...props}>
            <AlertTitle>{`${title || type}`}</AlertTitle>
            {message || description || children}
          </LabAlert>
        )}
      </Collapse>
    </Box>
  );
};

Alert.defaultProps = {
  closable: true,
  onClose: null,
  showIcon: true,
};

export default Alert;