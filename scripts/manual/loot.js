//to run this on testnet:
// $ npx hardhat run scripts/manual/loot.js

const https = require('https')
const hardhat = require('hardhat')

const host = `https://opensheet.elk.sh/1C0TWcgj8qQwBgfR-TQe5KcyA0XZQnIFRTdSclh_J_Ks/{TAB}`
const zero = '0x0000000000000000000000000000000000000000'

const exclude = [
  1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 
  1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020, 
  1021, 1022, 1023, 1024, 1025,
  2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2010,
  2011, 2012, 
  4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009, 4010, 
  4011, 4012, 4013, 4014, 4015, 4016, 4017, 4018, 4019, 4020, 
  4021, 4022, 4023, 4024, 4025, 4026, 4027, 4028, 4029, 4030, 
  4031, 4032, 4033, 4034, 4035, 4036, 4037, 4038, 4039, 4040, 
  4041, 4042, 4043, 4044, 4045, 4046, 4047, 4048, 4049, 4050, 
  4051, 4052, 4053, 4054, 
  5001, 5002, 5010, 5014,
  6001, 6002, 6003, 6004, 6005, 6006, 6007, 6008, 6009, 6010
]

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

function updateContracts(items) {
  //provide new instructions to update contract manually
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

  const config = hardhat.config.networks[hardhat.config.defaultNetwork]
  const loot = { address: config.contracts.loot }
  const store = { address: config.contracts.store }

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

function insertSQL(items) {
  const template = 'INSERT INTO Loot (ID, ItemID, Category, Image, '
    + 'Name, Quantity, Attributes, Pricing) VALUES (%s);'
  for (const item of items) {
    console.log(template.replace('%s', [
      item.edition,
      `'${item.itemId}'`,
      `'${item.category}'`,
      `'${item.image}'`,
      `'${item.name}'`,
      item.limit,
      `'${JSON.stringify(item.attributes)}'`,
      `'${JSON.stringify(item.pricing)}'`
    ].join(', ')))
  }
}

async function main() {

  const json = {}
  json.rides = await api(host.replace('{TAB}', '1-Rides'))
  json.boats = await api(host.replace('{TAB}', '2-Boats'))
  json.bling = await api(host.replace('{TAB}', '4-Bling'))
  json.hustles = await api(host.replace('{TAB}', '5-Hustles'))
  json.cribs = await api(host.replace('{TAB}', '6-Cribs'))

  //format loot items
  const items = []
  parseRides(json.rides, items)
  parseBoats(json.boats, items)
  parseBling(json.bling, items)
  parseHustles(json.hustles, items)
  parseCribs(json.cribs, items)

  updateContracts(items.filter(item => exclude.indexOf(item.edition) < 0))
  insertSQL(items)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
});