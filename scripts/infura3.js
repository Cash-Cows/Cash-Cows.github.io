const fs = require('fs')
const path = require('path')
const ipfsClient = require('ipfs-http-client')
require('dotenv').config()

const key = process.env.INFURA_API_KEY
const secret = process.env.INFURA_API_SECRET
const ipfs = ipfsClient.create({ 
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`
  }
})

const JSON_FOLDER = path.join(process.cwd(), 'artengine/build/json')
ipfs.add(files, (pin ? { pin: true } : {}))