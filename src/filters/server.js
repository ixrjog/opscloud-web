export function getStatusTagType (value) {
  switch (value) {
    case 0:
      return 'primary'
    case 1:
      return 'success'
    case 2:
      return 'warning'
    case 3:
      return 'info'
    default:
      return 'danger'
  }
}

export function getStatusTagText (value) {
  switch (value) {
    case 0:
      return '新建'
    case 1:
      return '已录入'
    case 2:
      return '标记删除'
    case 3:
      return '删除'
    default:
      return '未定义'
  }
}

/**
 * 返回换算后的内存单位GiB
 * @param value
 * @returns {string}
 */
export function getMemoryText (value) {
  // const memory = value / 1024
  return value / 1024
}
