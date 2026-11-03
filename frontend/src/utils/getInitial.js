/**
 * Avatar initials fallback character.
 * Priority (issue #5, §3): name first letter → email first letter → '?'
 */
export function getInitial(user) {
  if (!user) return '?';
  if (user.name) return user.name.charAt(0).toUpperCase();
  if (user.email) return user.email.charAt(0).toUpperCase();
  return '?';
}
