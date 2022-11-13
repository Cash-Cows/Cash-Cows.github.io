const fs = require('fs')
const path = require('path')
const glob = require('glob')
const handlebars = require('handlebars')

function build(name, files, frequency = 'weekly', priority = 0.5) {
  console.log(name, files)

  const date = new Date()
  const now = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  files = files.map(file => `https://www.cashcows.club${file.substring(
    path.resolve(__dirname, `../docs`).length
  )}`)

  fs.writeFileSync(
    path.resolve(__dirname, `../docs/sitemap-${name}.xml`),
    handlebars.compile(
      fs.readFileSync(path.resolve(__dirname, `layouts/sitemap.xml`), 'utf8')
    )({ name, files, now, frequency, priority })
  )
}

//static
glob(path.resolve(__dirname, '../docs') + '/**/*.html', (e, files) => {
  if (e) return console.error(e)
  files = files
    .filter(file => file.indexOf('goerli') < 0)
    .filter(file => file.indexOf('ethereum/crew') < 0)
    .filter(file => file.indexOf('ethereum/member') < 0)
    .filter(file => file.indexOf('bind.html') < 0)
  build('static', files)
})

//ethereum crew profile
glob(path.resolve(__dirname, '../docs') + '/ethereum/crew/*/profile.html', (e, files) => {
  if (e) return console.error(e)
  build('profile', files)
})

//ethereum crew barn
glob(path.resolve(__dirname, '../docs') + '/ethereum/crew/*/barn.html', (e, files) => {
  if (e) return console.error(e)
  build('barn', files)
})

//ethereum crew market
glob(path.resolve(__dirname, '../docs') + '/ethereum/crew/*/market.html', (e, files) => {
  if (e) return console.error(e)
  build('market', files)
})

//ethereum crew store
glob(path.resolve(__dirname, '../docs') + '/ethereum/crew/*/store.html', (e, files) => {
  if (e) return console.error(e)
  build('store', files)
})

//ethereum members
glob(path.resolve(__dirname, '../docs') + '/ethereum/member/*.html', (e, files) => {
  if (e) return console.error(e)
  build('member', files)
})