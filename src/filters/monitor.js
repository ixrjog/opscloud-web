export function getAvailableTagType (value) {
  switch (value) {
    case 0:
      return 'danger'
    case 1:
      return 'success'
    case 2:
      return 'info'
    default:
      return 'danger'
  }
}
