export function getUserRoleType (value) {
  switch (value) {
    case 'User':
      return 'success'
    case 'Auditor':
      return 'warning'
    case 'Admin':
      return 'danger'
    default:
      return 'info'
  }
}

export function getUserRoleText (value) {
  switch (value) {
    case 'User':
      return '用户'
    case 'Auditor':
      return '审计员'
    case 'Admin':
      return '管理员'
    default:
      return '未定义'
  }
}

// isActive
export function getActiveType (value) {
  switch (value) {
    case true:
      return 'success'
    case false:
      return 'warning'
    default:
      return 'info'
  }
}

export function getActiveText (value) {
  switch (value) {
    case true:
      return '有效'
    case false:
      return '无效'
    default:
      return '未定义'
  }
}
