import { toast } from "sonner";

/**
 * Toast utility functions for consistent notification styling across the app
 * Uses Sonner for beautiful, accessible toast notifications
 */

export const showSuccess = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 2000,
    style: {
      background: '#682A53',
      color: '#ffffff',
      border: '2px solid #8B3A6B',
      fontWeight: 500,
    },
  });
};

export const showError = (message: string, description?: string) => {
  toast.error(message, {
    description,
    duration: 2000,
    style: {
      background: '#dc2626',
      color: '#ffffff',
      border: '2px solid #991b1b',
      fontWeight: 500,
    },
  });
};

export const showWarning = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    duration: 5000,
    style: {
      background: '#f59e0b',
      color: '#ffffff',
      border: '2px solid #d97706',
      fontWeight: 500,
    },
  });
};

export const showInfo = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 4000,
    style: {
      background: '#2563eb',
      color: '#ffffff',
      border: '2px solid #1d4ed8',
      fontWeight: 500,
    },
  });
};

/**
 * Show success toast for pipeline action completion
 */
export const showActionSuccess = (
  actionType: string,
  clientName?: string,
  transitioned?: boolean,
  newStage?: string
) => {
  const message = transitioned
    ? `${actionType} completed & moved to ${newStage}!`
    : `${actionType} completed successfully!`;

  toast.success(message, {
    description: clientName ? `Client: ${clientName}` : undefined,
    duration: 2000,
    style: {
      background: '#682A53',
      color: '#ffffff',
      border: '2px solid #8B3A6B',
      fontWeight: 500,
    },
  });
};

/**
 * Show error toast for pipeline action failure with multiple errors
 */
export const showActionError = (actionType: string, errors: string[]) => {
  const description = errors.length > 1
    ? errors.map((error, i) => `• ${error}`).join('\n')
    : errors[0];

  toast.error(`Failed to complete ${actionType}`, {
    description,
    duration: 2000,
    style: {
      background: '#dc2626',
      color: '#ffffff',
      border: '2px solid #991b1b',
      fontWeight: 500,
    },
  });
};

/**
 * Show error with retry action button
 */
export const showRetryableError = (message: string, onRetry: () => void) => {
  toast.error(message, {
    description: "Click Retry to try again",
    action: {
      label: "Retry",
      onClick: onRetry,
    },
    duration: 2000,
    style: {
      background: '#dc2626',
      color: '#ffffff',
      border: '2px solid #991b1b',
      fontWeight: 500,
    },
  });
};

/**
 * Show loading toast that can be updated
 */
export const showLoadingToast = (message: string) => {
  return toast.loading(message);
};

/**
 * Update an existing toast
 */
export const updateToast = (
  toastId: string | number,
  type: "success" | "error" | "info",
  message: string,
  description?: string
) => {
  const toastFn = type === "success" ? toast.success : type === "error" ? toast.error : toast.info;
  toastFn(message, {
    id: toastId,
    description,
  });
};

/**
 * Dismiss a specific toast or all toasts
 */
export const dismissToast = (toastId?: string | number) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};
