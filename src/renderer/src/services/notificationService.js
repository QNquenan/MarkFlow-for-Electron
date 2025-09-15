let notificationCenter = null

// 初始化通知中心
export const initNotificationCenter = (instance) => {
  notificationCenter = instance
}

// 显示通知的通用方法
export const showNotification = (options) => {
  if (notificationCenter) {
    notificationCenter.addNotification(options)
  } else {
    console.warn('Notification center not initialized')
  }
}

// 显示成功通知
export const showSuccess = (title, message, duration) => {
  showNotification({
    title,
    message,
    type: 'success',
    duration
  })
}

// 显示警告通知
export const showWarning = (title, message, duration) => {
  showNotification({
    title,
    message,
    type: 'warning',
    duration
  })
}

// 显示错误通知
export const showError = (title, message, duration) => {
  showNotification({
    title,
    message,
    type: 'error',
    duration
  })
}