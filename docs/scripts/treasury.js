window.addEventListener('web3sdk-ready', async () => {
  //------------------------------------------------------------------//
  // Variables
  const response = await fetch('/data/metadata.json')
  const database = await response.json()
  const occurances = {}

  const unclaimed = document.querySelector('span.treasury-unclaimed span.value')
  const redeemed = document.querySelector('span.treasury-redeemed span.value')
  const rewards = document.querySelector('span.total-rewards span.value')
  const results = document.querySelector('main.results')

  const template = {
    item: document.getElementById('template-result-item').innerHTML,
    modal: document.getElementById('template-modal').innerHTML,
    loadingModal: document.getElementById('template-loading-modal').innerHTML,
    attribute: document.getElementById('template-attribute-box').innerHTML
  }

  const network = Web3SDK.network('ethereum')
  const nft = network.contract('nft')
  const index = network.contract('index')
  const royalty = network.contract('royalty')
  const metadata = network.contract('metadata')

  let toggled = false

  //------------------------------------------------------------------//
  // Functions
  const loading = (isShow)=>{
    if(isShow){
      const modal = theme.toElement(template.loadingModal, {
        '{MESSAGE}': "Please wait...", 
      }) 
      document.body.appendChild(modal)
      window.doon(modal)
    }else{ 
      document.body.removeChild(document.querySelector('div.loading'))
    }
  }
  const connected = async state => {
    //populate cows 
    console.log("connected",Web3SDK.state);
    loading(true); 
    Web3SDK.state.tokens = await index.read().ownerTokens(nft.address, state.account)  
    console.log("Web3SDK.state.tokens",Web3SDK.state);
    if (!Web3SDK.state.tokens.length) {
      results.innerHTML = '<div class="alert alert-error alert-outline">You don\'t have a cow.</div>'
    } else {
      rewards.innerHTML = 'Loading...'
    }

    results.innerHTML = "";
    Web3SDK.state.tokens.forEach(async (tokenId, i) => {
      const index = tokenId - 1
      const stage = parseInt(await metadata.read().stage(tokenId))
      const row = database[index]
      let badge = 'muted'
      if (row.rank < 100) {
        badge = 'success'
      } else if (row.rank < 500) {
        badge = 'warning'
      } else if (row.rank < 1000) {
        badge = 'info'
      }
      const item = theme.toElement(template.item, {
        '{INDEX}': index,
        '{NAME}': `#${tokenId}`,
        '{RANK}': row.rank,
        '{BADGE}': badge,
        '{SCORE}': row.score,
        '{ID}': tokenId,
        '{LEVEL}': stage + 1,
        '{IMAGE}': `/images/collection/${tokenId}_${stage}.png`,
        '{CHECKVALUE}': tokenId,
        '{ISCHECKED}': i < 10 ? 'checked': ''
      })

      results.appendChild(item)
      window.doon(item)
    })

    //get total rewards
    rewards.innerHTML = Web3SDK.toEther(
      await royalty.read()['releaseableBatch(uint256[])'](Web3SDK.state.tokens),
      'number'
    ).toFixed(6)

     
    theme.hide('.connected', false)
    theme.hide('.disconnected', true)
    theme.hide('.hide',true);  
    loading(false);
  }

  const rarity = function() {
    database.forEach(row => {
      Object.keys(row.attributes).forEach(trait => {
        const value = row.attributes[trait]
        if (!occurances[trait]) occurances[trait] = {}
        if (!occurances[trait][value]) occurances[trait][value] = 0
        occurances[trait][value]++
        //reformat
        row.attributes[trait] = { value }
      })
    })

    //add occurance and score to each
    database.forEach(row => {
      row.score = 0
      Object.keys(row.attributes).forEach(trait => {
        const value = row.attributes[trait].value
        const occurance = occurances[trait][value]
        row.attributes[trait].occurances = occurance
        row.attributes[trait].score = 1 / (occurance / database.length)
        row.score += row.attributes[trait].score
      })
    })

    //now we need to determine each rank
    let rank = 1
    const ranked = database.slice().sort((a, b) => b.score - a.score)
    ranked.forEach((row, i) => {
      row.rank = i == 0 
        || Math.floor(ranked[i - 1].score) == Math.floor(row.score) 
        ? rank
        : ++rank
    })
  }

  const disconnected = async _ => {
    delete Web3SDK.state.tokens
    results.innerHTML = ''
  }

  //------------------------------------------------------------------//
  // Events

  window.addEventListener('modal-open-click', async (e) => {
    const level = parseInt(e.for.getAttribute('data-level'))
    const index = parseInt(e.for.getAttribute('data-index'))
    const row = database[index]
    const boxes = []
    Object.keys(row.attributes).forEach(trait => {
      const value = row.attributes[trait].value
      const occurance = occurances[trait][value]
      const percent = Math.floor(
        (occurance / database.length) * 10000
      ) / 100
      boxes.push(template.attribute
        .replace('{NAME}', trait)
        .replace('{VALUE}', value)
        .replace('{PERCENT}', percent)
      )
    })

    const releaseable = parseInt(
      await royalty.read()['releaseable(uint256)'](row.edition)
    )
    const modal = theme.toElement(template.modal, {
      '{COLOR}': row.attributes.Background.value.toLowerCase(),
      '{ID}': row.edition,
      '{CONTRACT}': nft.address,
      '{RANK}': row.rank,
      '{IMAGE}': `/images/collection/${row.edition}_${level - 1}.png`,
      '{REWARDS}': parseFloat(
        Web3SDK.toEther(releaseable, 'number') || '0.00'
      ).toFixed(5),
      '{LEVEL}': level,
      '{ATTRIBUTES}': boxes.join('')
    })

    document.body.appendChild(modal)
    window.doon(modal)
  })

  window.addEventListener('modal-close-click', () => {
    document.body.removeChild(document.querySelector('div.modal'))
  })

  window.addEventListener('redeem-click', async (e) => {
    const tokenId = parseInt(e.for.getAttribute('data-id'))
    //gas check
    try {
      await royalty.gas(Web3SDK.state.account, 0)['release(uint256)'](tokenId)
    } catch(e) {
      const pattern = /have (\d+) want (\d+)/
      const matches = e.message.match(pattern)
      if (matches && matches.length === 3) {
        e.message = e.message.replace(pattern, `have ${
          Web3SDK.toEther(matches[1], 'int').toFixed(5)
        } ETH want ${
          Web3SDK.toEther(matches[2], 'int').toFixed(5)
        } ETH`)
      }
      notify('error', e.message.replace('err: i', 'I'))
      console.error(e)
      return
    }
    //now redeem
    try {
      const confirmations = 2
      await royalty.write(Web3SDK.state.account, 0, {
        hash: function(resolve, reject, hash) {
          notify(
           'success', 
           `Transaction started on <a href="${network.config.chain_scanner}/tx/${hash}" target="_blank">
             ${network.config.chain_scanner}
           </a>. Please stay on this page and wait for ${confirmations} confirmations...`,
           1000000
          )
        },
        confirmation: function(resolve, reject, confirmationNumber, receipt) {
          if (confirmationNumber > confirmations) return
          if (confirmationNumber == confirmations) {
           notify('success', `${confirmationNumber}/${confirmations} confirmed on <a href="${network.config.chain_scanner}/tx/${receipt.transactionHash}" target="_blank">
             ${network.config.chain_scanner}
           </a>.`)
           window.location.reload()
           resolve()
           return
          }
          notify('success', `${confirmationNumber}/${confirmations} confirmed on <a href="${network.config.chain_scanner}/tx/${receipt.transactionHash}" target="_blank">
           ${network.config.chain_scanner}
          </a>. Please stay on this page and wait for ${confirmations} confirmations...`, 1000000)
        },
        receipt: function(resolve, reject, receipt) {
          notify(
           'success', 
           `Confirming on <a href="${network.config.chain_scanner}/tx/${receipt.transactionHash}" target="_blank">
             ${network.config.chain_scanner}
           </a>. Please stay on this page and wait for ${confirmations} confirmations...`,
           1000000
          )
        }
      })['release(uint256)'](tokenId)
    } catch(e) {
      notify('error', e.message.replace('err: i', 'I'))
      console.error(e)
      return
    }
  })

  window.addEventListener('redeem-selected-click', async () => {
    if (!Web3SDK.state.tokens?.length) {
      return notify('error', 'You don\'t have a cow.')
    }
    let selectedtokens = [];
    const selecteds = document.getElementsByClassName('checkbox-item'); 
    for(var selected of selecteds ){
      if(selected.checked){ 
        selectedtokens.push(selected.value);
      }
    }
    if (selectedtokens.length <= 0) {
      return notify('error', 'No token selected')
    }
    //gas check
    try {
      await royalty.gas(Web3SDK.state.account, 0)['releaseBatch(uint256[])'](selectedtokens)
    } catch(e) {
      const pattern = /have (\d+) want (\d+)/
      const matches = e.message.match(pattern)
      if (matches && matches.length === 3) {
        e.message = e.message.replace(pattern, `have ${
          Web3SDK.toEther(matches[1], 'int').toFixed(5)
        } ETH want ${
          Web3SDK.toEther(matches[2], 'int').toFixed(5)
        } ETH`)
      }
      notify('error', e.message.replace('err: i', 'I'))
      console.error(e)
      return
    }
    //now redeem
    try {
      const confirmations = 2
      await royalty.write(Web3SDK.state.account, 0, {
        hash: function(resolve, reject, hash) {
          notify(
           'success', 
           `Transaction started on <a href="${network.config.chain_scanner}/tx/${hash}" target="_blank">
             ${network.config.chain_scanner}
           </a>. Please stay on this page and wait for ${confirmations} confirmations...`,
           1000000
          )
        },
        confirmation: function(resolve, reject, confirmationNumber, receipt) {
          if (confirmationNumber > confirmations) return
          if (confirmationNumber == confirmations) {
           notify('success', `${confirmationNumber}/${confirmations} confirmed on <a href="${network.config.chain_scanner}/tx/${receipt.transactionHash}" target="_blank">
             ${network.config.chain_scanner}
           </a>.`)
           window.location.reload()
           resolve()
           return
          }
          notify('success', `${confirmationNumber}/${confirmations} confirmed on <a href="${network.config.chain_scanner}/tx/${receipt.transactionHash}" target="_blank">
           ${network.config.chain_scanner}
          </a>. Please stay on this page and wait for ${confirmations} confirmations...`, 1000000)
        },
        receipt: function(resolve, reject, receipt) {
          notify(
           'success', 
           `Confirming on <a href="${network.config.chain_scanner}/tx/${receipt.transactionHash}" target="_blank">
             ${network.config.chain_scanner}
           </a>. Please stay on this page and wait for ${confirmations} confirmations...`,
           1000000
          )
        }
      })['releaseBatch(uint256[])'](selectedtokens)

    } catch(e) {
      notify('error', e.message.replace('err: i', 'I'))
      console.error(e)
      return
    }
  })

  window.addEventListener('redeem-toggle-click', () => {
    //toggle hide
    theme.hide('section.section-3', toggled)
    theme.hide('div.checkbox-item-main', toggled)
    toggled = !toggled
  })

  //------------------------------------------------------------------//
  // Initialize

  //count occurances
  rarity()

  //get unclaimed
  unclaimed.innerHTML = parseFloat(Web3SDK.toEther(
    (await Web3SDK.web3().eth.getBalance(royalty.address)).toString(), 
    'number'
  ) || '0.00').toFixed(6)
  //get redeemed
  redeemed.innerHTML = parseFloat(Web3SDK.toEther(
    (await royalty.read()['totalReleased()']()).toString(),
    'number'
  ) || '0.00').toFixed(6)

  //start session

  window.ethereum.on("accountsChanged", async (accounts) => {  
    network.startSession(connected, disconnected, true)
  });
  window.ethereum.on("chainChanged", async () => { 
    network.startSession(connected, disconnected, true)
  });
  window.ethereum.on("close", (error) => { 
      console.log("Errorethereum",error);
  });
  network.startSession(connected, disconnected, true)
})