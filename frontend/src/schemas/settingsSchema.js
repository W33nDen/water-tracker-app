import * as yup from 'yup';

/** Treat an empty input as "not provided". */
const emptyToUndefined = (value) => (value === '' ? undefined : value);

/** True when the user started filling in any of the password fields. */
const changingPassword = (parent) =>
  Boolean(parent.oldPassword || parent.password || parent.repeatPassword);

const passwordRule = (requiredMessage) =>
  yup
    .string()
    .transform(emptyToUndefined)
    .test('required-if-changing', requiredMessage, function (value) {
      return !changingPassword(this.parent) || Boolean(value);
    })
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password must be at most 64 characters');

/**
 * SettingModal validation (issue #8).
 * Field names follow the ТЗ «UserInfo» rules: name ≤ 32, gender female|male,
 * email, oldPassword and password 8–64.
 * Password fields are optional, but once any of them is filled, all three are required.
 */
export const settingsSchema = yup.object({
  gender: yup.string().oneOf(['female', 'male']).required(),
  name: yup.string().trim().max(32, 'Name must be at most 32 characters'),
  email: yup.string().trim().required('Email is required').email('Enter a valid email'),
  oldPassword: passwordRule('Enter your current password'),
  password: passwordRule('Enter a new password'),
  repeatPassword: yup
    .string()
    .transform(emptyToUndefined)
    .test('required-if-changing', 'Repeat the new password', function (value) {
      return !changingPassword(this.parent) || Boolean(value);
    })
    .oneOf([yup.ref('password'), undefined], 'Passwords do not match'),
});
