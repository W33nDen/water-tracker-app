const { toZonedTime, fromZonedTime } = require('date-fns-tz');
const prisma = require('../config/prisma');
const HttpError = require('../helpers/HttpError');

/**
 * Returns the UTC start and end of "today" in the given IANA timezone.
 * Interval is half-open: [startOfDay, startOfNextDay)
 *
 * @param {string} tz - IANA timezone string e.g. "Europe/Kyiv"
 * @param {Date} [referenceDate=new Date()] - reference point in time (defaults to now)
 * @returns {{ start: Date, end: Date }}
 */
function getTodayUTCBounds(tz, referenceDate = new Date()) {
  const safeZone = tz || 'UTC';
  // Current moment in the requested timezone
  const zonedNow = toZonedTime(referenceDate, safeZone);

  // Build start of local day (00:00:00.000)
  const localStart = new Date(
    zonedNow.getFullYear(),
    zonedNow.getMonth(),
    zonedNow.getDate(),
    0, 0, 0, 0
  );
  // Build start of next local day (00:00:00.000)
  const localEnd = new Date(
    zonedNow.getFullYear(),
    zonedNow.getMonth(),
    zonedNow.getDate() + 1,
    0, 0, 0, 0
  );

  const start = fromZonedTime(localStart, safeZone);
  const end   = fromZonedTime(localEnd,   safeZone);

  return { start, end };
}

/**
 * Creates a new water record for the given user.
 *
 * @param {string} userId
 * @param {{ volume: number, time: string }} data
 * @returns {Promise<{ id: string, volume: number, time: Date }>}
 */
const createWater = async (userId, { volume, time }) => {
  return prisma.waterRecord.create({
    data: {
      userId,
      volume,
      time: new Date(time),
    },
    select: { id: true, volume: true, time: true },
  });
};

/**
 * Updates an existing water record (must belong to the given user).
 *
 * @param {string} userId
 * @param {string} recordId
 * @param {{ volume?: number, time?: string }} data
 * @returns {Promise<{ id: string, volume: number, time: Date }>}
 */
const updateWater = async (userId, recordId, data) => {
  const record = await prisma.waterRecord.findUnique({
    where: { id: recordId },
    select: { id: true, userId: true },
  });

  if (!record || record.userId !== userId) {
    throw HttpError(404, 'Water record not found');
  }

  const updateData = {};
  if (data.volume !== undefined) updateData.volume = data.volume;
  if (data.time   !== undefined) updateData.time   = new Date(data.time);

  return prisma.waterRecord.update({
    where: { id: recordId },
    data: updateData,
    select: { id: true, volume: true, time: true },
  });
};

/**
 * Deletes a water record (must belong to the given user).
 *
 * @param {string} userId
 * @param {string} recordId
 * @returns {Promise<void>}
 */
const deleteWater = async (userId, recordId) => {
  const record = await prisma.waterRecord.findUnique({
    where: { id: recordId },
    select: { id: true, userId: true },
  });

  if (!record || record.userId !== userId) {
    throw HttpError(404, 'Water record not found');
  }

  await prisma.waterRecord.delete({ where: { id: recordId } });
};

/**
 * Returns today's water records + percentage of daily norm achieved.
 *
 * @param {string} userId
 * @param {string} tz  - IANA timezone (e.g. "Europe/Kyiv")
 * @returns {Promise<{ records: Array<{id,volume,time}>, percentage: number }>}
 */
const getTodayWater = async (userId, tz) => {
  const { start, end } = getTodayUTCBounds(tz);

  const [records, user] = await Promise.all([
    prisma.waterRecord.findMany({
      where: {
        userId,
        time: { gte: start, lt: end },
      },
      select: { id: true, volume: true, time: true },
      orderBy: { time: 'asc' },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { dailyNorma: true },
    }),
  ]);

  const dailyNorma = user?.dailyNorma > 0 ? user.dailyNorma : 2000;
  const totalVolume = records.reduce((sum, r) => sum + r.volume, 0);
  // Raw percentage (not capped). Open question: cap at 100%? — see report.
  const percentage = Math.round((totalVolume / dailyNorma) * 100);

  return { records, percentage };
};

module.exports = { createWater, updateWater, deleteWater, getTodayWater, getTodayUTCBounds };
