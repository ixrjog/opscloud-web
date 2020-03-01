export function getCloudDBTypeTagType (value) {
  switch (value) {
    case 0:
      return 'primary'
    case 1:
      return 'warning'
    case 2:
      return 'success'
    case 3:
      return 'info'
    default:
      return 'danger'
  }
}

export function getCloudDBTypeTagText (value) {
  switch (value) {
    case 2:
      return 'Aliyun-DRS-Mysql'
    case 3:
      return 'AWS-DRS-Mysql'
    default:
      return '未定义'
  }
}
