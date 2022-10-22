//to run this on testnet:
// $ npx hardhat run scripts/loot.js

const fs = require('fs')
const path = require('path')
const https = require('https')
const hardhat = require('hardhat')

const host = `https://opensheet.elk.sh/1C0TWcgj8qQwBgfR-TQe5KcyA0XZQnIFRTdSclh_J_Ks/{TAB}`
const zero = '0x0000000000000000000000000000000000000000'

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
  const config = hardhat.config.networks[hardhat.config.defaultNetwork]
  const collectionId = getCollectionId(config.contracts.loot, parseInt(row.ID))
  const item = {
    edition: parseInt(row.ID),
    itemId: collectionId,
    name: row.Name,
    image: `https://www.wearecashcows.com/images/loot/${row.ID}.png`,
    category,
    rarity: row.Rarity,
    available: (new Date(`${row.Available} +800`)).getTime(),
    limit: row.Quantity.length? parseInt(row.Quantity): 0,
    attributes,
    pricing: {}
  }

  const eth = row.ETH.replace('Ξ', '').trim()
  if (eth.length) {
    item.pricing[zero] = ethers.utils.parseEther(eth).toString()
  }
  
  const dolla = row.DOLLA.replace('$', '').replace(/,/g, '').trim()
  if (dolla.length) {
    item.pricing[config.contracts.dolla] = ethers.utils.parseEther(dolla).toString()
  }

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
  const network = hardhat.config.defaultNetwork
  const config = hardhat.config.networks[network]
  const loot = { address: config.contracts.loot }
  const store = { address: config.contracts.store }
  const dolla = { address: config.contracts.dolla }

  const paths = {
    data: path.resolve(__dirname, `../data`),
    docs: path.resolve(__dirname, `../docs/data/${network}/loot`),
    server: path.resolve(__dirname, `../server/src/data/${network}/loot`)
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

  const supply = {}
  const prices = {}
  for (const item of items) {
    if (item.limit) {
      if (!supply[item.category]) {
        supply[item.category] = [[],[]]
      }

      supply[item.category][0].push(item.edition)
      supply[item.category][1].push(item.limit)
    }
    
    
    if (Object.keys(item.pricing).length) {
      if (!prices[item.category]) {
        prices[item.category] = [[],[],[]]
      }

      const token = []
      const price = []

      for (const address in item.pricing) {
        token.push(address)
        price.push(item.pricing[address])
      }

      prices[item.category][0].push(item.edition)
      prices[item.category][1].push(token)
      prices[item.category][2].push(price)
    }
  }

  fs.writeFileSync(
    `${paths.data}/loot.json`, 
    JSON.stringify(items.map(item => {
      const data = {
        edition: item.edition,
        itemId: item.itemId,
        name: item.name,
        image: item.image,
        category: item.category,
        rarity: item.rarity,
        limit: item.limit,
        attributes: item.attributes
      }
  
      data[network] = { pricing: item.pricing }
      return data
    }), null, 2)
  )

  fs.writeFileSync(
    `${paths.docs}.json`, 
    JSON.stringify(items, null, 2)
  )

  if (fs.existsSync(paths.docs)) {
    fs.rmSync(paths.docs, { recursive: true })
  }
  fs.mkdirSync(paths.docs)

  for (const item of items) {
    const loot = Object.assign({}, item)
    loot.attributes = toAttributeList(loot.attributes)
    fs.writeFileSync(
      path.join(paths.docs, `${String(item.edition).padStart(64, '0')}.json`),
      JSON.stringify(loot, null, 2)
    )
  }


  const instructions = { supply: [], prices: [] }
  
  for (const category in supply) {
    instructions.supply.push(
      ` - setMaxSupply(${"\n\n     "}${[
        JSON.stringify(supply[category][0]).replace(/"/g, ''),
        JSON.stringify(supply[category][1]).replace(/"/g, '')
      ].join("\n\n     ")}${"\n\n   "})${"\n\n"}`
    )
  }

  for (const category in prices) {
    instructions.prices.push(
      ` - setPrice(${"\n\n     "}${[
        JSON.stringify(prices[category][0]).replace(/"/g, ''),
        JSON.stringify(prices[category][1]).replace(/"/g, ''),
        JSON.stringify(prices[category][2]).replace(/"/g, '')
      ].join("\n\n     ")}${"\n\n   "})${"\n\n"}`
    )
  }

  if (instructions.supply.length) {
    console.log('-----------------------------------')
    console.log('In CashCowsLoot contract, set supply')
    console.log(` - ${config.scanner}/address/${loot.address}#writeContract`)
    instructions.supply.forEach(instruction => console.log(instruction))
  }

  if (instructions.prices.length) {
    console.log('-----------------------------------')
    console.log('In CashCowsStore contract, set prices')
    console.log(` - ${config.scanner}/address/${store.address}#writeContract`)
    instructions.prices.forEach(instruction => console.log(instruction))
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
});