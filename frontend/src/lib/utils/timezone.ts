/**
 * Timezone utility functions to handle UTC timestamps from the database
 */

/**
 * Parse a date string that may or may not have timezone information
 * Assumes UTC if no timezone is specified
 */
export function parseUTCDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  
  try {
    // If the string contains 'T' (ISO format) but no timezone info (+/Z), assume UTC
    if (dateString.includes('T') && !dateString.includes('+') && !dateString.includes('Z')) {
      return new Date(dateString + 'Z'); // Add Z to treat as UTC
    }
    
    return new Date(dateString);
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return null;
  }
}

/**
 * Format a UTC date string for display in the user's local timezone
 */
export function formatDateLocal(
  dateString: string | null | undefined, 
  options?: Intl.DateTimeFormatOptions
): string {
  const date = parseUTCDate(dateString);
  if (!date) return "Unknown";
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

/**
 * Format a UTC date string with time for display in the user's local timezone
 */
export function formatDateTimeLocal(
  dateString: string | null | undefined, 
  options?: Intl.DateTimeFormatOptions
): string {
  const date = parseUTCDate(dateString);
  if (!date) return "Unknown";
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  return date.toLocaleString('en-US', { ...defaultOptions, ...options });
}

/**
 * Get relative time string (e.g., "2 hours ago") from UTC date
 */
export function getRelativeTime(dateString: string | null | undefined): string {
  const date = parseUTCDate(dateString);
  if (!date) return "Unknown";
  
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return diffInSeconds <= 5 ? 'Just now' : `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return formatDateLocal(dateString, { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
}
