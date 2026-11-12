/**
 * Format date to readable string e.g. "Nov 12, 2026"
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'No deadline';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  const defaultOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
};

/**
 * Format date to time string e.g. "09:30 AM"
 */
export const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

/**
 * Format full date & time e.g. "Nov 12, 2026 at 2:30 PM"
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  return `${formatDate(date)} at ${formatTime(date)}`;
};

/**
 * Check if date is in the past relative to now
 */
export const isOverdue = (dateString, status) => {
  if (!dateString) return false;
  if (status === 'Completed' || status === 'Cancelled') return false;
  const date = new Date(dateString);
  return date.getTime() < Date.now();
};

/**
 * Check if date is today
 */
export const isToday = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

/**
 * Format input string for datetime-local input fields (YYYY-MM-DDTHH:mm)
 */
export const toDateTimeLocalString = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const pad = (num) => String(num).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Get days in month array for calendar generator
 */
export const getCalendarMonthDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDay.getDay(); // 0 is Sunday
  const daysInMonth = lastDay.getDate();

  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    calendarDays.push({
      date: new Date(year, month - 1, day),
      dayNumber: day,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      date: new Date(year, month, day),
      dayNumber: day,
      isCurrentMonth: true,
      isToday:
        day === new Date().getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear(),
    });
  }

  // Next month leading days (fill 42 days grid for consistent 6 rows)
  const remainingSlots = 42 - calendarDays.length;
  for (let day = 1; day <= remainingSlots; day++) {
    calendarDays.push({
      date: new Date(year, month + 1, day),
      dayNumber: day,
      isCurrentMonth: false,
    });
  }

  return calendarDays;
};
