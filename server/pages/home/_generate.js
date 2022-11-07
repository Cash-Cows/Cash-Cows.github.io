const fs = require('fs')
const path = require('path')

// /{NETWORK}/home/script.js
// /{NETWORK}/home/style.css
// /{NETWORK}/home/index.html
module.exports = async ({file, root, config, handlebars }) => {

  if (path.basename(file) === 'index.html') {
    fs.writeFileSync(path.join(config.build, 'index.html'), handlebars.compile(
      fs.readFileSync(file, 'utf8')
    )())
    return
  } else if (path.basename(file) === 'gallery.html') {
    fs.writeFileSync(path.join(config.build, 'gallery.html'), handlebars.compile(
      fs.readFileSync(file, 'utf8')
    )())
    return
  }

  const destination = path.join(
    config.build, 
    file.substring(root.length + 1)
  )
  if (!fs.existsSync(path.dirname(destination))) {
    fs.mkdirSync(path.dirname(destination), { recursive: true })
  }
  console.log('Compiling', file, destination)
  fs.writeFileSync(destination, handlebars.compile(
    fs.readFileSync(file, 'utf8')
  )())
}