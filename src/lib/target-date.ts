/**
 * If targetDate is earlier than postTime, return true.
 * Used to short-circuit processing of older posts.
 * @param postTime
 * @param targetDate - date in YYYYMMDD format
 * @param timezoneOffset - hours (0 for UTC)
 * @returns
 */
export function earlierThenTargetDate(
  postTime: Date,
  targetDate: string,
  timezoneOffset: number = 0
): boolean {
  const { startOfDay } = targetDateRange(targetDate, timezoneOffset);
  return postTime < startOfDay;
}

/**
 * If postTime is within target date range, return true.
 * @param postTime
 * @param targetDate - date in YYYYMMDD format
 * @param timezoneOffset - hours (0 for UTC)
 * @returns
 */
export function withinTargetDate(
  postTime: Date,
  targetDate: string,
  timezoneOffset: number = 0
): boolean {
  const { startOfDay, endOfDay } = targetDateRange(targetDate, timezoneOffset);
  return postTime >= startOfDay && postTime <= endOfDay;
}

/**
 * Return startOfDay and endOfDay for the target date
 * @param yyyymmdd - date in YYYYMMDD format
 * @param timezoneOffset - hours (0 for UTC)
 * @returns
 */
export function targetDateRange(yyyymmdd: string, timezoneOffset: number = 0) {
  const year = yyyymmdd.slice(0, 4);
  const month = yyyymmdd.slice(4, 6);
  const day = yyyymmdd.slice(6, 8);
  const startOfDay = new Date(`${year}-${month}-${day}T00:00:00Z`);
  const endOfDay = new Date(`${year}-${month}-${day}T23:59:59.999Z`);
  if (!isValidDate(startOfDay) || !isValidDate(endOfDay)) {
    throw new Error('Invalid date format');
  }

  // Adjust for timezone offset
  // timezoneOffset is in hours, convert to milliseconds
  const offsetMs = timezoneOffset * 60 * 60 * 1000;

  // Create new dates with offset applied
  const adjustedStartOfDay = new Date(startOfDay.getTime() - offsetMs);
  const adjustedEndOfDay = new Date(endOfDay.getTime() - offsetMs);

  return { startOfDay: adjustedStartOfDay, endOfDay: adjustedEndOfDay };
}

/**
 * True if date is valid.
 * @param date
 * @returns
 */
function isValidDate(date: Date) {
  return date instanceof Date && !isNaN(date.getTime());
}
