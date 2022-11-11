//to run this on testnet:
// $ npx hardhat run scripts/loot.js

const fs = require('fs')
const path = require('path')
const https = require('https')
const hardhat = require('hardhat')

const host = `https://opensheet.elk.sh/1C0TWcgj8qQwBgfR-TQe5KcyA0XZQnIFRTdSclh_J_Ks/{TAB}`
const zero = '0x0000000000000000000000000000000000000000'
const networks = [ 'goerli', 'ethereum' ]

function parseBigInt(str, base = 10) {
  base = BigInt(base)
  var bigint = BigInt(0)
  for (var i = 0; i < str.length; i++) {
    var code = str[str.length - 1 - i].charCodeAt(0) - 48; if(code >= 10) code -= 39
    bigint += base**BigInt(i) * BigInt(code)
  }
  return bigint
}

function getCollectionId(address, id, base = 10) {
  address = address.replace('0x', '').toLowerCase();
  const addressBin = [];
  for(var c of address) {
    switch(c) {
      case '0': addressBin.push('0000'); break;
      case '1': addressBin.push('0001'); break;
      case '2': addressBin.push('0010'); break;
      case '3': addressBin.push('0011'); break;
      case '4': addressBin.push('0100'); break;
      case '5': addressBin.push('0101'); break;
      case '6': addressBin.push('0110'); break;
      case '7': addressBin.push('0111'); break;
      case '8': addressBin.push('1000'); break;
      case '9': addressBin.push('1001'); break;
      case 'a': addressBin.push('1010'); break;
      case 'b': addressBin.push('1011'); break;
      case 'c': addressBin.push('1100'); break;
      case 'd': addressBin.push('1101'); break;
      case 'e': addressBin.push('1110'); break;
      case 'f': addressBin.push('1111'); break;
      default: return '';
    }
  }

  return parseBigInt([
    id.toString(2).padStart(192, '0'),
    addressBin.join('').padStart(160, '0')
  ].join(''), 2).toString(base)
}

function toAttributeList(attributes) {
  const list = []
  for (const attribute in attributes) {
    list.push({ trait_name: attribute, value: attributes[attribute]})
  }
  return list
}

function api(url) {
  return new Promise((resolve, reject) => {
    const request = https.request(url, response => {
      let data = '';
      response.on('data', chunk => {
        data = data + chunk.toString()
      })
    
      response.on('end', _ => {
        resolve(JSON.parse(data))
      })
    })

    request.on('error', error => {
      reject(error)
    })

    request.end()
  })
}

function parseItem(category, row, attributes) {
  const item = {
    edition: parseInt(row.ID),
    name: row.Name,
    image: `https://www.cashcows.club/images/loot/${row.ID}.png`,
    category,
    rarity: row.Rarity,
    available: (new Date(`${row.Available} +800`)).getTime(),
    limit: row.Quantity.length? parseInt(row.Quantity): 0,
    attributes,
    networks: {}
  }

  networks.forEach(network => {
    const config = hardhat.config.networks[network]
    item.networks[network] = {
      itemId: getCollectionId(config.contracts.loot, parseInt(row.ID)),
      pricing: {}
    }

    const eth = row.ETH.replace('Ξ', '').trim()
    if (eth.length) {
      item.networks[network].pricing[zero] = ethers.utils.parseEther(eth).toString()
    }
    
    const dolla = row.DOLLA.replace('$', '').replace(/,/g, '').trim()
    if (dolla.length) {
      item.networks[network].pricing[config.contracts.dolla] = ethers.utils.parseEther(dolla).toString()
    }
  })

  return item
}

function parseRides(rows, items = []) {
  for (const row of rows) {
    if (!row.ID.length || !row.Available.length) continue
    items.push(parseItem('Rides', row, {
      Type: row.Type,
      Speed: row.Speed,
      Horsepower: row.Horsepower,
      Passengers: row.Passengers,
      Origin: row.Origin,
    }))
  }

  return items
}

function parseBoats(rows, items = []) {
  for (const row of rows) {
    if (!row.ID.length || !row.Available.length) continue
    items.push(parseItem('Boats', row, {
      Type: row.Type,
      Speed: row.Speed,
      Length: row.Length,
      Passengers: row.Passengers,
      Origin: row.Origin,
    }))
  }

  return items
}

function parseBling(rows, items = []) {
  for (const row of rows) {
    if (!row.ID.length || !row.Available.length) continue
    items.push(parseItem('Bling', row, {
      Type: row.Type,
      Material: row.Material,
      Gems: row.Gems,
      Karat: row.Karat,
      Weight: row.Weight,
      Origin: row.Origin,
    }))
  }

  return items
}

function parseHustles(rows, items = []) {
  for (const row of rows) {
    if (!row.ID.length || !row.Available.length) continue
    items.push(parseItem('Hustles', row, {
      Type: row.Type,
      'Monthly Profit': row['Monthly Profit'],
      Employees: row.Employees
    }))
  }

  return items
}

function parseCribs(rows, items = []) {
  for (const row of rows) {
    if (!row.ID.length || !row.Available.length) continue
    items.push(parseItem('Cribs', row, {
      Type: row.Type,
      Stories: row.Stories,
      Bedrooms: row.Bedrooms,
      Size: row.Size,
      Origin: row.Origin,
    }))
  }

  return items
}

async function main() {
  const paths = {
    data: path.resolve(__dirname, `../data`),
    docs: path.resolve(__dirname, `../docs/{NETWORK}/data/loot`)
  }

  const json = {}
  json.rides = await api(host.replace('{TAB}', '1-Rides'))
  json.boats = await api(host.replace('{TAB}', '2-Boats'))
  json.bling = await api(host.replace('{TAB}', '4-Bling'))
  json.hustles = await api(host.replace('{TAB}', '5-Hustles'))
  json.cribs = await api(host.replace('{TAB}', '6-Cribs'))

  const items = []
  parseRides(json.rides, items)
  parseBoats(json.boats, items)
  parseBling(json.bling, items)
  parseHustles(json.hustles, items)
  parseCribs(json.cribs, items)

  fs.writeFileSync(
    `${paths.data}/loot.json`, 
    JSON.stringify(items.map(item => {
      const data = {
        edition: item.edition,
        name: item.name,
        image: item.image,
        category: item.category,
        rarity: item.rarity,
        available: item.available,
        limit: item.limit,
        attributes: item.attributes,
        networks: item.networks
      }
      return data
    }), null, 2)
  )

  networks.forEach(network => {
    const docs = paths.docs.replace('{NETWORK}', network)
    fs.writeFileSync(
      `${docs}.json`, 
      JSON.stringify(items.map(item => ({
        edition: item.edition,
        itemId: item.networks[network].itemId,
        name: item.name,
        image: item.image,
        category: item.category,
        rarity: item.rarity,
        available: item.available,
        limit: item.limit,
        attributes: item.attributes,
        pricing: item.networks[network].pricing
      })), null, 2)
    )
  
    if (fs.existsSync(docs)) {
      fs.rmSync(docs, { recursive: true })
    }
    fs.mkdirSync(docs)
  
    for (const item of items) {
      const loot = {
        edition: item.edition,
        itemId: item.networks[network].itemId,
        name: item.name,
        image: item.image,
        category: item.category,
        rarity: item.rarity,
        available: item.available,
        limit: item.limit,
        attributes: item.attributes,
        pricing: item.networks[network].pricing
      }
      loot.attributes = toAttributeList(loot.attributes)
      fs.writeFileSync(
        path.join(docs, `${item.edition.toString(16).padStart(64, '0')}.json`),
        JSON.stringify(loot, null, 2)
      )
    }
  })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
});