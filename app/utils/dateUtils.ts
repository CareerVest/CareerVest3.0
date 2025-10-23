/**
 * Date utility functions for formatting dates in EST timezone
 */

export const formatDateEST = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(dateObj);
};

export const formatDateOnlyEST = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dateObj);
};

export const formatTimeOnlyEST = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(dateObj);
};

export const getCurrentDateEST = (): string => {
  return new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

export const formatRelativeTimeEST = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
};

// Legacy functions for client forms
export const formatDateForInput = (date: Date | string | null): string => {
  if (!date) return "";

  // If already a string in YYYY-MM-DD format, return as is
  if (typeof date === 'string') {
    // Check if it's already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Otherwise convert string to Date first
    date = new Date(date);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseDateForState = (dateString: string | null): Date | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Converts a date to ISO string format while preserving the local date
 * Solves the timezone issue where selecting today's date shows as yesterday
 *
 * @param date - Date object, string, null, or undefined
 * @returns ISO string with time set to noon UTC to avoid timezone shifts, or null
 */
export const toISOStringPreservingDate = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;

  let dateObj: Date;

  if (typeof date === 'string') {
    // If string is already in YYYY-MM-DD format, append time to avoid UTC interpretation
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      dateObj = new Date(date + 'T12:00:00');
    } else {
      dateObj = new Date(date);
    }
  } else {
    dateObj = new Date(date);
  }

  // Set time to noon to avoid timezone edge cases
  dateObj.setHours(12, 0, 0, 0);

  return dateObj.toISOString();
};

/**
 * Converts a date to YYYY-MM-DD string format for date-only fields
 * Best for enrollment dates, payment dates, etc. where time is not needed
 *
 * @param date - Date object, string, null, or undefined
 * @returns Date string in YYYY-MM-DD format, or null
 */
export const toDateOnlyString = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;

  let dateObj: Date;

  if (typeof date === 'string') {
    // If string is in YYYY-MM-DD format, parse it correctly
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split('-').map(Number);
      dateObj = new Date(year, month - 1, day);
    } else {
      dateObj = new Date(date);
    }
  } else {
    dateObj = new Date(date);
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Safely formats a date for display without timezone issues
 * Handles both Date objects and string formats
 *
 * @param date - Date object, string, null, or undefined
 * @param locale - Locale string (default: "en-US")
 * @returns Formatted date string or "Not set"
 */
export const formatDateForDisplay = (
  date: Date | string | null | undefined,
  locale: string = "en-US"
): string => {
  if (!date) return "Not set";

  try {
    let dateStr: string;

    if (typeof date === 'string') {
      // Already a string, use as-is if in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        dateStr = date;
      } else {
        // Try to parse it as a date string
        dateStr = new Date(date).toISOString().split('T')[0];
      }
    } else {
      // It's a Date object
      dateStr = date.toISOString().split('T')[0];
    }

    // Add noon time to avoid timezone issues
    const dateWithTime = new Date(dateStr + "T12:00:00");

    return dateWithTime.toLocaleDateString(locale);
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return "Invalid Date";
  }
};

/**
 * Converts 24-hour time format to 12-hour format with AM/PM
 *
 * @param time24 - Time in HH:mm format (24-hour)
 * @returns Time in 12-hour format with AM/PM (e.g., "01:30 PM")
 */
export const formatTimeTo12Hour = (time24: string | null | undefined): string => {
  if (!time24) return "Not set";

  try {
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const period = hour24 >= 12 ? 'PM' : 'AM';

    return `${hour12.toString().padStart(2, '0')}:${minutes} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', time24, error);
    return "Invalid Time";
  }
};
