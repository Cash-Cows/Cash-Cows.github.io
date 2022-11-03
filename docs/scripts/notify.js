window.notify = (type, message, timeout = 5000) => {
  Array.from(document.querySelectorAll('div.notification')).forEach((notification) => {
    if (notification.mounted) {
      document.body.removeChild(notification)
      notification.mounted = false
    }
  })
  const container = document.createElement('div')
  container.className = `notification notification-${type}`
  container.innerHTML = `<div>${message}</div>`
  container.mounted = true
  document.body.appendChild(container)
  container.addEventListener('click', () => {
    document.body.removeChild(container)
    container.mounted = false
  })
  
  setTimeout(() => {
    if (container.mounted) {
      document.body.removeChild(container)
      container.mounted = false
    }
  }, timeout)
}