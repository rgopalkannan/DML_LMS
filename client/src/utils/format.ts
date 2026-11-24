const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatDate = (iso: string): string => DATE.format(new Date(iso));
