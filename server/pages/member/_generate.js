const fs = require('fs')
const path = require('path')

const networks = ['goerli', 'ethereum']

// /{NETWORK}/member/script.js
// /{NETWORK}/member/style.css
// /{NETWORK}/member/index.html
module.exports = async ({file, root, config, handlebars }) => {
  networks.forEach(network => {
    const destination = path.join(
      config.build, 
      network,
      file.substring(root.length + 1)
    )
    if (!fs.existsSync(path.dirname(destination))) {
      fs.mkdirSync(path.dirname(destination), { recursive: true })
    }
    console.log('Compiling', file, network)
    fs.writeFileSync(destination, handlebars.compile(
      fs.readFileSync(file, 'utf8')
    )({ network }))
  })
}