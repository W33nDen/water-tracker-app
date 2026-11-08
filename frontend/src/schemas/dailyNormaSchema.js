import * as yup from 'yup';

const parseNumber = (val, orig) => {
  if (typeof orig === 'string') {
    const normalized = orig.trim().replace(',', '.');
    return normalized === '' ? 0 : Number(normalized);
  }
  return typeof val === 'number' && !isNaN(val) ? val : 0;
};

const parseWaterRate = (val, orig) => {
  if (typeof orig === 'string') {
    const normalized = orig.trim().replace(',', '.');
    return normalized === '' ? NaN : Number(normalized);
  }
  return val;
};

/**
 * Validation schema for DailyNormaModal (issue #9).
 *
 * Weight (kg) and activityTime (hours) are used for formula calculation.
 * waterRate (in Liters) is the planned amount sent to backend.
 * Boundary checks:
 *   0.001 L = 1 ml (minimum allowed by backend)
 *   15 L = 15000 ml (maximum allowed by backend, issue AC)
 */
export const dailyNormaSchema = yup.object({
  gender: yup.string().oneOf(['female', 'male']).required(),
  weight: yup
    .number()
    .transform(parseNumber)
    .min(0, 'Weight must be 0 or greater')
    .max(500, 'Weight must be at most 500 kg')
    .typeError('Enter a valid number'),
  activityTime: yup
    .number()
    .transform(parseNumber)
    .min(0, 'Activity time must be 0 or greater')
    .max(24, 'Activity time cannot exceed 24 hours')
    .typeError('Enter a valid number'),
  waterRate: yup
    .number()
    .transform(parseWaterRate)
    .typeError('Enter a valid number')
    .required('Write down how much water you will drink')
    .min(0.001, 'Amount must be at least 0.001 L (1 ml)')
    .max(15, 'Amount cannot exceed 15 L (15000 ml)'),
});

