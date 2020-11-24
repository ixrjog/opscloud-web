export function getAvailableTagType (value) {
  switch (value) {
    case 0:
      return 'info'
    case 1:
      return 'success'
    case 2:
      return 'danger'
    default:
      return 'danger'
  }
}
