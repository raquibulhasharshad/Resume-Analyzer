/**
 * Formats an ISO date string from the backend into the user's PC local date and time.
 * Automatically appends 'Z' to ISO strings that lack timezone indicators to ensure 
 * accurate conversion from UTC to the local PC timezone.
 */
export function formatLocalDateTime(dateInput) {
  if (!dateInput) return 'N/A';

  try {
    let str = String(dateInput);

    if (str.length >= 10 && str.includes('T') && !str.endsWith('Z') && !str.includes('+') && !str.slice(10).includes('-')) {
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
  } catch (e) {
    return String(dateInput || 'N/A');
  }
}
