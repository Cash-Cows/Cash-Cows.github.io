const fs = require('fs')
const path = require('path')
const axios = require('axios')
const ethers = require('ethers')

const crewdb = require('../../../data/crew.json')

const networks = ['goerli', 'ethereum']

const thresh = 3
const tasks = []
let progress = 0
const queue = task => {
  //this is the actual task runner
  const runner = async task => {
    await task()
    await new Promise(r => setTimeout(r, 1000))
    if (tasks.length) {
      runner(tasks.shift())
    } else {
      progress--
    }
  }
  //if too many in progress
  if (progress >= thresh) {
    //just queue
    tasks.push(task)
  } else {
    runner(task)
    progress++
  }
}

// /{NETWORK}/member/script.js
// /{NETWORK}/member/style.css
// /{NETWORK}/member/index.html
module.exports = async ({file, root, config, handlebars }) => {
  for (const network of networks) {
    const destination = path.join(
      config.build, 
      network,
      file.substring(root.length + 1)
    )
    if (!fs.existsSync(path.dirname(destination))) {
      fs.mkdirSync(path.dirname(destination), { recursive: true })
    }
    console.log('Compiling', file, network)
    const title = 'Member Achievements | Cash Cows Club'
    const description = 'Support the Cash Cow Club members as they earn rewards, get loot and progress through the Metaverse.'
    const banner = 'https://www.cashcows.club/images/pfp-genesis.png'
    const canonical = `member`
    fs.writeFileSync(destination, handlebars.compile(
      fs.readFileSync(file, 'utf8')
    )({ network, title, description, banner, path: canonical }))

    if (network !== 'ethereum') continue

    const networkConfig = require(`../../public/${network}/data/network.json`)
    const provider = new ethers.providers.JsonRpcProvider(networkConfig.chain_uri)

    const contract = {
      crew: new ethers.Contract(
        networkConfig.contracts.crew.address, 
        networkConfig.contracts.crew.abi,
        provider
      ),
      milk: new ethers.Contract(
        networkConfig.contracts.milk.address, 
        networkConfig.contracts.milk.abi,
        provider
      ),
      dolla: new ethers.Contract(
        networkConfig.contracts.dolla.address, 
        networkConfig.contracts.dolla.abi,
        provider
      ),
      index: new ethers.Contract(
        networkConfig.contracts.index.address, 
        networkConfig.contracts.index.abi,
        provider
      )
    }

    if (file.indexOf('index.html') >= 0) {
      const boards = ['crew', 'milk', 'dolla']
      for (const name of boards) {
        const response = await axios.get(`https://api.cashcows.club/leaderboard/${name}.php`)
        for (const member of response.data.holders) {
          queue(async _ => {
            const crew = (await contract.crew.balanceOf(member.address)).toString()
            const milk = parseInt(ethers.utils.formatEther(await contract.milk.balanceOf(member.address)).toString())
            const dolla = parseInt(ethers.utils.formatEther(await contract.dolla.balanceOf(member.address)).toString())

            let banner = 'https://www.cashcows.club/images/pfp-genesis.png'
            const tokens = await contract.index.ownerTokens(
              networkConfig.contracts.crew.address, 
              member.address,
              4030
            )
            if (tokens.length) {
              const data = crewdb.filter(row => row.edition.toString() == tokens[0].toString())[0]
              banner = `https://cdn.cashcows.club/crew/preview/${tokens[0]}_${
                data.attributes.Level.value? data.attributes.Level.value - 1: 0
              }.png`
            }

            const stats = []
            if (crew) {
              stats.push(`${crew} Cows.`)
            }

            if (milk) {
              stats.push(`${milk} $MILK.`)
            }

            if (dolla) {
              stats.push(`${dolla} $DOLLA.`)
            }
            
            const title = `Member ${member.address} Achievements | Cash Cows Club`
            const description = `${stats.join(' ')} Support ${member.address} a Cash Cow Club member as they earn rewards, get loot and progress through the Metaverse.`
            const canonical = `member/${member.address}.html`
            const destination = path.join(
              config.build, 
              network,
              `member/${member.address}.html`
            )

            console.log(`Compiling member/${member.address}.html`)
            fs.writeFileSync(destination, handlebars.compile(
              fs.readFileSync(file, 'utf8')
            )({ network, member, title, description, banner, path: canonical }))
          })
        }
      }
      console.log('Done!')
    }
  }
}