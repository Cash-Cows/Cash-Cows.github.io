const path = require('path')
const root = path.join(process.cwd(), 'artengine')

module.exports = {
  default_weight: 100,
  default_blend: 'source-over',
  default_opacity: 1,
  preview: {
    width: 300,
    height: 300
  },
  image: {
    width: 2000,
    height: 2000
  },
  pixelated: 2 / 24,
  start_edition: 1,
  cid_version: 0,
  smoothing: true,
  shuffle_layers: true,
  add_preview: false,
  paths: {
    root,
    config: path.resolve(root, 'config'),
    build: path.resolve(root, 'build'),
    layers: path.resolve(root, 'layers'),
    cache: path.resolve(root, '.artengine')
  },
  metadata_template: {
    name: 'Cash Cows #{EDITION}',
    description: '#{EDITION} of 7,777 Cash Cows. CC0 PFPs that share the wealth.',
    image: 'https://ipfs.io/ipfs/{HIRES_CID}',
    external_url: 'https://www.wearecashcows.com/gallery?edition={EDITION}'
  },
  layers: [
    //{
    //  config: "layers/all",
    //  limit: 100
    //},
    {
      config: "layers/filtered",
      limit: 100
    },
    {
      config: "layers/masks",
      limit: 50
    },
    {
      config: "layers/alien",
      limit: 10
    },
    {
      config: "layers/cyborg",
      limit: 10
    }
  ]
}