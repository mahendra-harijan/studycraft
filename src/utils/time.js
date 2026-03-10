const parseTimeToMinutes = (timeText) => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeText || '');
  if (!match) {
    return null;
  }
  return Number(match[1]) * 60 + Number(match[2]);
};

const minutesToTime = (minutes) => {
  const hrs = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}`;
};

module.exports = { parseTimeToMinutes, minutesToTime };