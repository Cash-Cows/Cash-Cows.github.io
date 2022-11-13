const fs = require('fs')
const path = require('path')
const ethers = require('ethers')

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

      let title, description
      switch(basename) {
        case 'profile':
          title = `Crew #${id} Profile | Cash Cows Club`
          description = `Rank ${crew[i].rank}, from the ${crew[i].attributes.Crew.value} crew. Check this ${crew[i].attributes.Hide.value} cow and its traits, rewards and loot.`
          break
        case 'barn': 
          title = `The Barn | Crew #${id} | Cash Cows Club`
          description = `From the ${crew[i].attributes.Crew.value} crew, this ${crew[i].attributes.Hide.value} cow can produce ${
            Math.floor(ethers.utils.formatEther(rates.milk.rate).toString() * (60 * 60 * 24))
          } liters of $MILK per day.`
          break
        case 'market': 
          title = `Farmers Market | Crew #${id} | Cash Cows Club`
          description = `Crew #${id} $MILK is saleable for 10x $DOLLAS at the farmers market.`
          break
        case 'store': 
          title = `Loot Store | Crew #${id} | Cash Cows Club`
          description = `Get ${crew[i].attributes.Crew.value} crew discounts. Soulbound loot (SBT) that is forever bound to your NFT. Use in the Metaverse.`
          break
      }

      fs.writeFileSync(destination, handlebars.compile(
        fs.readFileSync(file, 'utf8')
      )({
        path: `crew/${id}/${basename}.html`,
        script: `/${network}/crew/${basename}`,
        style: `/${network}/crew/${basename}`,
        title: title,
        description: description,
        network: network,
        config: require(`../../public/${network}/data/network.json`), 
        metadata: {
          edition: crew[i].edition,
          image: `https://cdn.cashcows.club/crew/preview/${crew[i].edition}_${Math.max(crew[i].attributes.Level.value - 1 , 0)}.png`,
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