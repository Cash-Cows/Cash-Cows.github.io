const giflossy = require('giflossy')
const cid = require('ipfs-only-hash')
const { execFile } = require('child_process')
const { paths, cid_version } = require('../config/engine')
 
execFile(giflossy, ['-O3', '--lossy=80', '-o', 'output.gif', 'input.gif'], err => {
  console.log('Image minified!');
});

async function main() {
  //get all gif images
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})