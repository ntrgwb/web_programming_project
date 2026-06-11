const pad = (number) => String(number).padStart(2, "0");

const formatDateShort = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = pad(date.getFullYear() % 100);
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());

  return `${day}/${month}/${year} ${hour}:${minute}`;
};

const parseVietnamDateTime = (value, options = {}) => {
  if (!value) return null;

  const trimmed = String(value).trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    const nativeDate = new Date(trimmed);
    return Number.isNaN(nativeDate.getTime()) ? null : nativeDate;
  }

  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const rawYear = parseInt(match[3], 10);
  const year = match[3].length === 2 ? 2000 + rawYear : rawYear;
  const hour = match[4] === undefined ? (options.defaultHour ?? 0) : parseInt(match[4], 10);
  const minute = match[5] === undefined ? (options.defaultMinute ?? 0) : parseInt(match[5], 10);

  if (month < 1 || month > 12 || day < 1 || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  const date = new Date(year, month - 1, day, hour, minute);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute
  ) {
    return null;
  }

  return date;
};

module.exports = {
  formatDateShort,
  parseVietnamDateTime
};
