export const formatDate = (date: Date | string, longFormat: boolean = true): string => {
  if (typeof date === 'string') {
    date = new Date(date);
  }

  if (longFormat) {
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};