import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';

export interface ConfirmationDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Dialog title */
  title: string;
  /** Dialog content/message */
  message: string | React.ReactNode;
  /** Text for the confirm button (default: "Confirm") */
  confirmText?: string;
  /** Text for the cancel button (default: "Cancel") */
  cancelText?: string;
  /** Whether the confirm action is loading/processing */
  loading?: boolean;
  /** Whether the confirm action is destructive (uses error color) */
  destructive?: boolean;
  /** Callback when dialog should be closed */
  onClose: () => void;
  /** Callback when user confirms the action */
  onConfirm: () => void;
  /** Whether to disable the dialog close when loading */
  preventCloseOnLoading?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  destructive = false,
  onClose,
  onConfirm,
  preventCloseOnLoading = true,
}) => {
  const handleClose = () => {
    if (preventCloseOnLoading && loading) return;
    onClose();
  };

  const renderMessage = () => {
    if (typeof message === 'string') {
      return <DialogContentText>{message}</DialogContentText>;
    }
    return <>{message}</>;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="confirmation-dialog-title"
    >
      <DialogTitle id="confirmation-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        {renderMessage()}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          color="primary"
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color={destructive ? 'error' : 'primary'}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
          variant={destructive ? 'contained' : 'text'}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
