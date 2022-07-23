const fs = require('fs')
const path = require('path')
const { paths } = require('../config/engine')
const feed = path.join(paths.build, 'json')

const layerIndex = {}

async function isFolder(folder) {
  if (!fs.existsSync(folder)) return false
  const stat = await fs.promises.stat(folder)
  return !stat.isFile()
}

function makeTable(head, body) {
  const tableTemplate = `<table border="1" cellpadding="5" cellspacing="0">
    <thead>
      {HEAD}
    </thead>
    <tbody>
      {BODY}
    </tbody>
  </table>`
    
  body = body.map(row => `<tr>${row.join('')}</tr>`)
  
  return tableTemplate
    .replace('{HEAD}', `<tr>${head.join('')}</tr>`)
    .replace('{BODY}', body.join("\n    "))
}

function makeRarityTable(traits, datalist) {
  const head = [
    '<th align="left" nowrap>Trait</th>', 
    '<th align="right" nowrap>Occurrence</th>', 
    '<th align="right" nowrap>Chance</th>'
  ]
  const body = []

  for (const trait in traits) {
    body.push([ trait, traits[trait], ((traits[trait] / datalist.length) * 100).toFixed(2)])
  }

  body.sort((a, b) => a[1] - b[1])
  return makeTable(head, body.map(row => [
    `<td width="220" nowrap>${row[0]}</td>`, 
    `<td nowrap align="right">${row[1]}</td>`, 
    `<td nowrap align="right">${row[2]}%</td>`
  ]))
}

function makeNFTTable(datalist, occurrences) {
  const body = []
  const head = [
    '<th align="right">Rank</th>', 
    '<th align="right">ID</th>', 
    '<th>Image</th>',
    '<th align="right">Score</th>',
  ]

  const keys = Object.keys(occurrences)
  keys.forEach(attribute => head.push(`<th>${attribute}</th>`))

  datalist.sort((a, b) => b.score - a.score)
  let rank = 1
  datalist.forEach((metadata, i) => {
    const attributes = {}
    metadata.attributes.forEach(attribute => {
      attributes[attribute.trait_type] = attribute
    })
    const nextRank = i == 0 
      || Math.floor(datalist[i - 1].score) == Math.floor(metadata.score) 
      ? rank
      : ++rank
    //build row
    const row = [
      `<td align="right">${nextRank}</td>`, 
      `<td align="right">${metadata.edition}</td>`, 
      `<td nowrap>
        <img width="100" src="./image/${metadata.edition}_0.png" />
        <img width="100" src="./image/${metadata.edition}_1.png" />
        <img width="100" src="./image/${metadata.edition}_2.png" />
      </td>`, 
      `<td align="right">${Math.floor(metadata.score)}</td>`, 
    ]

    keys.forEach(attribute => 
      row.push(`<td nowrap>${attributes[attribute].value}<br /><small><em>${
        (attributes[attribute].percent * 100).toFixed(2)
      }%</em></small></td></td>`)
    )

    body.push(row)
  })

  return makeTable(head, body)
}

async function main() {
  if (!await isFolder(feed)) throw new Error(`build/json folder missing`)
  const occurrences = {}
  const datalist = []
  const files = (await fs.promises.readdir(feed))
    .filter(file => path.extname(file) === '.json')
  //populate datalist and occurances
  for (const file of files) {
    if (!/^\d+_0/.test(file)) continue
    const metadata = require(path.resolve(feed, file))
    datalist.push(metadata)
    metadata.attributes.forEach(attribute => {
      //add overall occurances
      if (!occurrences[attribute.trait_type]) {
        occurrences[attribute.trait_type] = {}
      }

      if (!occurrences[attribute.trait_type][attribute.value]) {
        occurrences[attribute.trait_type][attribute.value] = 0
      }
      occurrences[attribute.trait_type][attribute.value]++
    })
  }

  // fill up items with occurrences in metadata
  for (const metadata of datalist) {
    metadata.score = 0
    metadata.attributes.forEach(attribute => {
      attribute.occurrences = occurrences[attribute.trait_type][attribute.value]
      attribute.percent = attribute.occurrences / datalist.length
      attribute.score = 1 / attribute.percent
      metadata.score += attribute.score
    })
  }

  const outputBuffer = []
  outputBuffer.push('<div style="display:flex">')
  outputBuffer.push('<div style="margin-right: 20px">')

  for (const attribute in occurrences) {
    outputBuffer.push(`<h3>Feature: ${attribute}</h3>`)
    outputBuffer.push(makeRarityTable(occurrences[attribute], datalist))
  }

  outputBuffer.push('</div><div>')
  outputBuffer.push(`<h3>NFTs</h3>`)
  outputBuffer.push(makeNFTTable(datalist, occurrences))
  outputBuffer.push('</div>')

  fs.writeFileSync(
    path.join(paths.build, 'rarity.html'), 
    outputBuffer.join("\n")
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch(error => {
  console.error(error)
  process.exit(1)
})