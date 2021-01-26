export function userFilters (user) {
  if (user === null) {
    return ''
  }
  return user.username + '<' + user.displayName + '>'
}
