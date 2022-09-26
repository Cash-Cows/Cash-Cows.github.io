const path = require('path')
const root = path.join(process.cwd(), 'gifengine')

module.exports = {
  default_weight: 100,
  default_blend: 'source-over',
  default_opacity: 1,
  image: {
    width: 590,
    height: 590
  },
  pixelated: 1 / 27,
  start_edition: 1,
  cid_version: 0,
  smoothing: true,
  shuffle_layers: true,
  paths: {
    root,
    config: path.resolve(root, 'config'),
    build: path.resolve(root, 'build'),
    layers: path.resolve(root, 'layers'),
    cache: path.resolve(root, '.artengine')
  },
  metadata_template: {
    name: 'Cash Cows Club #{EDITION}',
    description: '#{EDITION} of 2,000 Cash Cows. CC0 PFPs that share the wealth.',
    image: 'https://ipfs.io/ipfs/{CID}',
    external_url: 'https://www.wearecashcows.com/club/gallery?edition={EDITION}'
  },
  layers: [
    {
      config: "layers/all",
      series: "Test",
      limit: 10
    }
  ],
  _layers: [
    //used to test a single or many layers. just paste the one/s 
    //you want to test below here, then rename _layers to layers.
  ]
}
