// formatting.utils.ts — Date, number, and string formatting utilities.
// Uses native Javascript Date.

/**
 * Formats an ISO timestamp as a relative time string (e.g., "2 min ago").
 */
export function formatRelativeTime(isoTimestamp: string): string {
  try {
    const date = new Date(isoTimestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffSecs < 60) {return `${diffSecs} sec ago`;}
    if (diffMins < 60) {return `${diffMins} min ago`;}
    if (diffHours < 24) {return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;}
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } catch {
    return isoTimestamp;
  }
}

/**
 * Formats an ISO timestamp as a human-readable date/time.
 * Shows "Today 14:30", "Yesterday 09:15", or "3 Jun 14:30".
 */
export function formatDateTime(isoTimestamp: string): string {
  try {
    const date = new Date(isoTimestamp);
    const now = new Date();

    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${mins}`;

    if (isToday) {
      return `Today ${timeStr}`;
    }
    if (isYesterday) {
      return `Yesterday ${timeStr}`;
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${timeStr}`;
  } catch {
    return isoTimestamp;
  }
}

/**
 * Formats an ISO timestamp as time only (e.g., "14:30:15").
 */
export function formatTime(isoTimestamp: string): string {
  try {
    const date = new Date(isoTimestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    const secs = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${mins}:${secs}`;
  } catch {
    return isoTimestamp;
  }
}

/**
 * Formats an ISO timestamp as a full date (e.g., "3 June 2024").
 */
export function formatDate(isoTimestamp: string): string {
  try {
    const date = new Date(isoTimestamp);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch {
    return isoTimestamp;
  }
}

/**
 * Formats a trust score as a percentage string with one decimal place.
 */
export function formatTrustScore(score: number): string {
  return `${Math.round(score)}`;
}

/**
 * Formats a number with commas for thousands separators.
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-IN');
}

/**
 * Truncates a string to the specified length with ellipsis.
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return `${str.slice(0, maxLength - 1)}…`;
}

/**
 * Formats duration in milliseconds to a human-readable string.
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

/**
 * Formats bytes into human-readable size (e.g., "1.5 MB").
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
