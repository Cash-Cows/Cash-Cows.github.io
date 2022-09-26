//to run this on testnet:
//$ npx hardhat run scripts/phase4/6-milk-data.js

const hardhat = require('hardhat')

const fs = require('fs')
const path = require('path')
const database = require('../../docs/data/metadata.json')

function release(collection, tokenId, rate) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      ['string', 'address', 'uint256', 'uint256'],
      ['release', collection, tokenId, rate]
    ).slice(2),
    'hex'
  )
}

/*
  "Mooooon": 403,
  "Origins": 395,
  "Genesis": 380,
  "Bulls": 290,
  "Degens": 277,
  "Skittles": 275,
  "Chicken Dinner": 273,
  "Bling Bling": 244,
  "Styles": 180,
  "Undead": 177,
  "Panthers": 129,
  "Party Time": 126,
  "4AM": 118,
  "Aliens": 117,
  "Chocolate": 107,
  "Cyborgs": 107,
  "Pure Bred": 61,
  "Jolly Cows": 51,
  "Bandits": 50,
  "Mad Cows": 46,
  "Brawlers": 40,
  "Dimes": 32,
  "Moo Money": 21,
  "Big Reds": 20,
  "True Blue": 20,
  "Playboys": 18,
  "Rangers": 17,
  "Ballers": 16,
  "Cowboys": 12,
  "Holy Cows": 9,
  "Invisible": 7,
  "Royals": 6,
  "Golden Boys": 5
*/

const crews = {
  "Mooooon": 4,
  "Origins": 5,
  "Genesis": 6,
  "Bulls": 7,
  "Degens": 8,
  "Skittles": 9,
  "Chicken Dinner": 10,
  "Bling Bling": 12,
  "Styles": 14,
  "Undead": 16,
  "Panthers": 18,
  "Party Time": 20,
  "4AM": 22,
  "Aliens": 24,
  "Chocolate": 26,
  "Cyborgs": 28,
  "Pure Bred": 30,
  "Jolly Cows": 32,
  "Bandits": 34,
  "Mad Cows": 36,
  "Brawlers": 38,
  "Dimes": 40,
  "Moo Money": 42,
  "Big Reds": 44,
  "True Blue": 46,
  "Playboys": 48,
  "Rangers": 50,
  "Ballers": 52,
  "Cowboys": 54,
  "Holy Cows": 56,
  "Invisible": 58,
  "Royals": 60,
  "Golden Boys": 60
}

async function main() {
  const network = hardhat.config.networks[hardhat.config.defaultNetwork]
  const signer = new ethers.Wallet(network.accounts[0])
  const nft = { address: network.contracts.nft }

  let totalRate = 0

  for (const row of database.rows) {
    const rate = ethers.utils.parseUnits(String(crews[row.attributes.Crew])).div(60 * 60 * 24).toString()

    totalRate += crews[row.attributes.Crew]

    row.barn = {
      rate: rate,
      proof: await signer.signMessage(
        release(nft.address, row.edition, rate)
      )
    }
  }

  fs.writeFileSync(
    path.resolve(__dirname, '../../docs/data/metadata.json'),
    JSON.stringify(database, null, 2)
  )

  console.log(totalRate)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
});