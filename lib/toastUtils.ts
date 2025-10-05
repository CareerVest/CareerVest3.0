import { toast } from "sonner";

/**
 * Toast utility functions for consistent notification styling across the app
 * Uses Sonner for beautiful, accessible toast notifications
 */

export const showSuccess = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 4000,
    style: {
      background: '#f0fdf4',
      color: '#14532d',
      border: '2px solid #16a34a',
      fontWeight: 500,
    },
  });
};

export const showError = (message: string, description?: string) => {
  toast.error(message, {
    description,
    duration: 6000,
    style: {
      background: '#fef2f2',
      color: '#7f1d1d',
      border: '2px solid #dc2626',
      fontWeight: 500,
    },
  });
};

export const showWarning = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    duration: 5000,
    style: {
      background: '#fefce8',
      color: '#713f12',
      border: '2px solid #ca8a04',
      fontWeight: 500,
    },
  });
};

export const showInfo = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 4000,
    style: {
      background: '#eff6ff',
      color: '#1e3a8a',
      border: '2px solid #2563eb',
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
    duration: 5000,
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
    duration: 7000,
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
    duration: 10000,
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
