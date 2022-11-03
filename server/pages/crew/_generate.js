const fs = require('fs')
const path = require('path')

const crew = require('../../../data/crew.json')
const networks = ['goerli', 'ethereum']

crew.forEach(item => {
  for (const trait in item.attributes) {
    item.attributes[trait].percent = Math.floor(
      (item.attributes[trait].occurances / crew.length) * 100
    ) / 100
  }
})

function injectPath(path, index, str) {
  const array = path.split('/')
  array.splice(index, 0, str)
  return array.join('/')
}

function capitalize(str) {
  return str[0].toUpperCase() + str.substring(1).replace(/[_\-]/g, ' ')
}

// /{NETWORK}/crew/barn.js
// /{NETWORK}/crew/barn.css
// /{NETWORK}/crew/{EDITION}/barn.html
// /{NETWORK}/crew/market.js
// /{NETWORK}/crew/market.css
// /{NETWORK}/crew/{EDITION}/market.html
// /{NETWORK}/crew/store.js
// /{NETWORK}/crew/store.css
// /{NETWORK}/crew/{EDITION}/store.html
// /{NETWORK}/crew/profile.js
// /{NETWORK}/crew/profile.css
// /{NETWORK}/crew/{EDITION}/profile.html
// /{NETWORK}/crew/index.js
// /{NETWORK}/crew/index.css
// /{NETWORK}/crew/index.html
// /{NETWORK}/crew/manage.js
// /{NETWORK}/crew/manage.css
// /{NETWORK}/crew/manage.html
module.exports = async ({file, root, config, handlebars }) => {
  if (['.js', '.css'].indexOf(path.extname(file)) >= 0) {
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
      fs.writeFileSync(destination, fs.readFileSync(file, 'utf8'))
    })
    return
  }

  if (path.extname(file) !== '.html') {
    return
  }

  if (['index.html', 'manage.html'].indexOf(path.basename(file)) >= 0) {
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
    return
  }

  console.log('Compiling', file, `/NETWORK/${
    injectPath(file.substring(root.length + 1), 1, `1-${crew.length}`)
  }`)

  const basename = path.basename(file, '.html')

  for (let i = 0; i < crew.length; i++) {
    const id = crew[i].edition
    networks.forEach(network => {
      const destination = path.join(
        config.build, 
        network,
        injectPath(file.substring(root.length + 1), 1, id)
      )

      const connection = require(`../../public/${network}/data/network.json`)
      const rates = {}
      rates.milk = crew[i].networks[network].rates[connection.contracts.milk.address] || 0
      rates.dolla = crew[i].networks[network].rates[connection.contracts.dolla.address] || 0

      if (!fs.existsSync(path.dirname(destination))) {
        fs.mkdirSync(path.dirname(destination), { recursive: true })
      }

      fs.writeFileSync(destination, handlebars.compile(
        fs.readFileSync(file, 'utf8')
      )({
        path: `${network}/crew/${id}/${basename}`,
        script: `/${network}/crew/${basename}`,
        style: `/${network}/crew/${basename}`,
        title: `Crew #${id} ${capitalize(basename)} | Cash Cows`,
        network: network,
        config: require(`../../public/${network}/data/network.json`), 
        metadata: {
          edition: crew[i].edition,
          image: `/images/crew/${crew[i].edition}_${Math.max(crew[i].attributes.Level.value || 0, 0)}.png`,
          color: crew[i].attributes.Background.value.toLowerCase(),
          characterId: crew[i].networks[network].characterId,
          score: (crew[i].score || 0).toFixed(2),
          rank: crew[i].rank,
          images: crew[i].images,
          attributes: crew[i].attributes,
          rates: rates,
          loot: crew[i].networks[network].loot
        }
      }))
    })
  }

  console.log('Done!')
}