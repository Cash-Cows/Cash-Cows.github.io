const fs = require('fs')
const path = require('path')
const axios = require('axios')
const ethers = require('ethers')

const networks = ['goerli', 'ethereum']

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
    fs.writeFileSync(destination, handlebars.compile(
      fs.readFileSync(file, 'utf8')
    )({ network, title, description }))

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
      )
    }

    if (file.indexOf('index.html') >= 0) {
      const boards = ['crew', 'milk', 'dolla']
      for (const name of boards) {
        const response = await axios.get(`https://api.cashcows.club/leaderboard/${name}.php`)
        for (const member of response.data.holders) {
          const crew = (await contract.crew.balanceOf(member.address)).toString()
          const milk = parseInt(ethers.utils.formatEther(await contract.milk.balanceOf(member.address)).toString())
          const dolla = parseInt(ethers.utils.formatEther(await contract.dolla.balanceOf(member.address)).toString())

          const stats = []
          if (crew) {
            stats.push(`${crew} Cows.`)
          }

          if (milk) {
            stats.push(`${milk} $MILK.`)
          }

          if (crew) {
            stats.push(`${crew} $DOLLA.`)
          }
          
          const title = `Member ${member.address} Achievements | Cash Cows Club`
          const description = `${stats.join(' ')} Support ${member.address} a Cash Cow Club member as they earn rewards, get loot and progress through the Metaverse.`
          const destination = path.join(
            config.build, 
            network,
            `member/${member.address}.html`
          )

          console.log(`Compiling member/${member.address}.html`)
          fs.writeFileSync(destination, handlebars.compile(
            fs.readFileSync(file, 'utf8')
          )({ network, member, title, description }))
        }
      }
      console.log('Done!')
    }
  }
}