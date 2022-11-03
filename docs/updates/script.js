(_ => {
  const nav = document.querySelectorAll('a.nav-hash')
  const content = document.querySelectorAll('div.content')

  Array.from(nav).forEach(link => {
    link.addEventListener('click', e => {
      Array.from(nav).forEach(link => link.classList.remove('active'))
      Array.from(nav).forEach(navlink => {
        if (navlink.href == link.href) navlink.classList.add('active')
      })
      Array.from(content).forEach(content => content.classList.remove('active'))
      document.querySelector(link.getAttribute('href')).classList.add('active')
    })
  })

  if (window.location.hash) {
    Array.from(nav).forEach(link => {
      if (link.getAttribute('href') === window.location.hash) {
        link.click()
      }
    })
  }

  window.doon(document.body)
})()