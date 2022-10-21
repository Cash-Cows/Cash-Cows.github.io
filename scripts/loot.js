//to run this on testnet:
// $ npx hardhat run scripts/loot.js

const fs = require('fs')
const path = require('path')
const https = require('https')
const hardhat = require('hardhat')

const host = `https://opensheet.elk.sh/1C0TWcgj8qQwBgfR-TQe5KcyA0XZQnIFRTdSclh_J_Ks/{TAB}`
const zero = '0x0000000000000000000000000000000000000000'

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
    image: `https://www.wearecashcows.com/images/loot/${row.ID}.png`,
    category,
    rarity: row.Rarity,
    limit: row.Quantity.length? parseInt(row.Quantity): 0,
    attributes,
    pricing: {}
  }

  const eth = row.ETH.replace('Ξ', '').trim()
  if (eth.length) {
    item.pricing[zero] = ethers.utils.parseEther(eth).toString()
  }
  
  const config = hardhat.config.networks[hardhat.config.defaultNetwork]
  const dolla = row.DOLLA.replace('$', '').replace(/,/g, '').trim()
  if (dolla.length) {
    item.pricing[config.contracts.dolla] = ethers.utils.parseEther(dolla).toString()
  }

  return item
}

function parseRides(rows, items = []) {
  for (const row of rows) {
    if (!row.ID.length) continue
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
    if (!row.ID.length) continue
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
    if (!row.ID.length) continue
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
    if (!row.ID.length) continue
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
    if (!row.ID.length) continue
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
  json.bling = await api(host.replace('{TAB}', '3-Bling'))
  json.hustles = await api(host.replace('{TAB}', '4-Hustles'))
  json.cribs = await api(host.replace('{TAB}', '5-Cribs'))

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

  fs.writeFileSync(
    `${paths.server}.json`, 
    JSON.stringify(items, null, 2)
  )

  if (fs.existsSync(paths.docs)) {
    fs.rmSync(paths.docs, { recursive: true })
  }
  fs.mkdirSync(paths.docs)
  if (fs.existsSync(paths.server)) {
    fs.rmSync(paths.server, { recursive: true })
  }
  fs.mkdirSync(paths.server)

  for (const item of items) {
    const loot = Object.assign({}, item)
    loot.attributes = toAttributeList(loot.attributes)
    fs.writeFileSync(
      path.join(paths.docs, `${String(item.edition).padStart(64, '0')}.json`),
      JSON.stringify(loot, null, 2)
    )
    fs.writeFileSync(
      path.join(paths.server, `${String(item.edition).padStart(64, '0')}.json`),
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
    //console.log(` - ${config.scanner}/address/${loot.address}#writeContract`)
    instructions.supply.forEach(instruction => console.log(instruction))
  }

  if (instructions.prices.length) {
    console.log('-----------------------------------')
    console.log('In CashCowsStore contract, set prices')
    //console.log(` - ${config.scanner}/address/${store.address}#writeContract`)
    instructions.prices.forEach(instruction => console.log(instruction))
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
});