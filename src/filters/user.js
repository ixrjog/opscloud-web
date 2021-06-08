export function userFilters (user) {
  if (user === null) {
    return ''
  }
  if (user.name !== undefined && user.name !== null && user.name !== '') {
    return `${user.username}<${user.name}:${user.displayName}>`
  }
  return `${user.username}<${user.displayName}>`
}
