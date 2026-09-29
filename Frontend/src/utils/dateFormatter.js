/**
 * Formats an ISO date string from the backend into the user's PC local date and time.
 * Automatically appends 'Z' to ISO strings that lack timezone indicators to ensure 
 * accurate conversion from UTC to the local PC timezone.
 */
export function formatLocalDateTime(dateInput) {
  if (!dateInput) return 'N/A';

  let str = String(dateInput);

  // If date string is in ISO format (contains 'T') but lacks timezone offset ('Z' or '+/-'),
  // append 'Z' so JavaScript Date constructor interprets it as UTC time rather than local naive time.
  if (str.includes('T') && !str.endsWith('Z') && !str.includes('+') && !str.slice(10).includes('-')) {
    str += 'Z';
  }

  const d = new Date(str);
  if (isNaN(d.getTime())) return String(dateInput);

  const formattedDate = d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });

  const formattedTime = d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return `${formattedDate} ${formattedTime}`;
}
