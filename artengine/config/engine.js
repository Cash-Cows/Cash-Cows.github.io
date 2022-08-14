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
  pixelated: 1 / 27,
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
    {
      config: "layers/aliens",
      series: "Aliens",
      limit: 222
    },
    {
      config: "layers/cyborgs",
      series: "Cyborgs",
      limit: 222
    },
    {
      config: "layers/zombies",
      series: "Undead",
      limit: 333
    },
    {
      config: "layers/angels",
      series: "Holy Cows",
      limit: 10
    },
    {
      config: "layers/angels1",
      series: "Holy Cows",
      limit: 5
    },
    {
      config: "layers/cowboys",
      series: "Cowboys",
      limit: 20
    },
    {
      config: "layers/ballers",
      series: "Ballers",
      limit: 22
    },
    {
      config: "layers/party1",
      series: "Party Time",
      limit: 222
    },
    {
      config: "layers/party2",
      series: "4AM",
      limit: 222
    },
    {
      config: "layers/bandits",
      series: "Bandits",
      limit: 94
    },
    {
      config: "layers/mad",
      series: "Mad Cows",
      limit: 111
    },
    {
      config: "layers/bandits1",
      series: "Bandits",
      limit: 5
    },
    {
      config: "layers/brawlers",
      series: "Brawlers",
      limit: 77
    },
    {
      config: "layers/degen",
      series: "Degens",
      limit: 444
    },
    {
      config: "layers/nude",
      series: "Playboys",
      limit: 33
    },
    {
      config: "layers/golden",
      series: "Golden Boys",
      limit: 11
    },
    {
      config: "layers/green",
      series: "Moo Money",
      limit: 33
    },
    {
      config: "layers/girls",
      series: "Dimes",
      limit: 33
    },
    {
      config: "layers/rainbow",
      series: "Skittles",
      limit: 555
    },
    {
      config: "layers/black",
      series: "Panthers",
      limit: 222
    },
    {
      config: "layers/chocolate",
      series: "Chocolate",
      limit: 222
    },
    {
      config: "layers/army",
      series: "Rangers",
      limit: 33
    },
    {
      config: "layers/royalty",
      series: "Royals",
      limit: 11
    },
    {
      config: "layers/red",
      series: "Big Reds",
      limit: 33
    },
    {
      config: "layers/blue",
      series: "True Blue",
      limit: 33
    },
    {
      config: "layers/bling",
      series: "Bling Bling",
      limit: 555
    },
    {
      config: "layers/styles",
      series: "Styles",
      limit: 333
    },
    {
      config: "layers/jolly",
      series: "Jolly Cows",
      limit: 99
    },
    {
      config: "layers/pure",
      series: "Pure Bred",
      limit: 99
    },
    {
      config: "layers/bulls",
      series: "Bulls",
      limit: 555
    },
    {
      config: "layers/origins",
      series: "Genesis",
      limit: 777
    },
    {
      config: "layers/origins",
      series: "Origins",
      limit: 777
    },
    {
      config: "layers/origins",
      series: "Chicken Dinner",
      limit: 555
    },
    {
      config: "layers/origins",
      series: "Mooooon",
      limit: 777
    },
    {
      config: "layers/invisible",
      series: "Invisible",
      limit: 22
    }
  ],
  _layers: [
    //used to test a single or many layers. just paste the one/s 
    //you want to test below here, then rename _layers to layers.
  ]
}
