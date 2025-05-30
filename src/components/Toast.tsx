import React, { useEffect, useState } from 'react';
import {
  Alert,
  Slide,
  Box,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useToast, type ToastMessage } from '../contexts/ToastContext';

interface ToastItemProps {
  toast: ToastMessage;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const { hideToast } = useToast();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger slide-in animation
    const timer = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShow(false);
    // Wait for slide-out animation before removing
    setTimeout(() => hideToast(toast.id), 200);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon fontSize="small" />;
      case 'error':
        return <ErrorIcon fontSize="small" />;
      case 'warning':
        return <WarningIcon fontSize="small" />;
      case 'info':
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  const getSeverity = () => {
    return toast.type === 'info' ? 'info' : toast.type;
  };

  return (
    <Slide direction="up" in={show} mountOnEnter unmountOnExit>
      <Alert
        severity={getSeverity()}
        icon={getIcon()}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        sx={{
          mb: 1,
          ml: 2,
          boxShadow: 3,
          borderRadius: 2,
          minWidth: 280,
          maxWidth: 400,
          '& .MuiAlert-message': {
            fontWeight: 500,
          },
        }}
      >
        {toast.message}
      </Alert>
    </Slide>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 88, // Position above the floating action button (56px height + 32px margin)
        right: 16,
        zIndex: 1400, // Higher than FAB but below modals
        display: 'flex',
        flexDirection: 'column-reverse', // Newest toasts appear at bottom
        alignItems: 'flex-end',
        pointerEvents: 'none', // Allow clicks to pass through the container
        '& > *': {
          pointerEvents: 'auto', // But enable interactions on individual toasts
        },
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </Box>
  );
};
