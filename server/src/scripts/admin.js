window.addEventListener('web3sdk-ready', async _ => {
  //------------------------------------------------------------------//
  // Variables
  const networkName = document.getElementById('network').getAttribute('data-value')
  const network = Web3SDK.network(networkName)

  //------------------------------------------------------------------//
  // Functions 

  const write = async (contract, method, args, success, error) => {
    try {
      await contract.gas(Web3SDK.state.account, 0)[method](...args)
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
      return error(e, e.message.replace('err: i', 'I'))
    }

    try {
      const confirmations = 2
      await contract.write(Web3SDK.state.account, 0, {
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
           success()
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
      })[method](...args)
    } catch(e) {
      return error(e, e.message.replace('err: i', 'I'))
    }
  }

  //------------------------------------------------------------------//
  // Events
  
  window.addEventListener('web3sdk-connected', async _ => {})

  window.addEventListener('web3sdk-disconnected',  async _ => {})

  document.querySelectorAll('form').forEach(
    form => form.addEventListener('submit', e => {
      e.preventDefault()
      const form = new FormData(e.target)
      const params = { args: [] }
      for (let [key, value] of form) {
        if (key === 'contract') {
          params.contract = network.contract(value)
        } else if (key === 'method') {
          params.method = value
        } else if (key === 'arg') {
          value = value
            .replace(/(0x[0-9a-fA-F]+)/g, `"$1"`)
            .replace(/^[0-9]{10,}$/g, `"$0"`)
            .replace(/,\s*([0-9]{10,}),/g, `,"$1",`)
            .replace(/\[([0-9]{10,}),/g, `["$1",`)
            .replace(/,\s*([0-9]{10,})\]/g, `,"$1"]`)
            .replace(/\[([0-9]{10,})\]/g, `["$1"]`)
          if (value.indexOf('[') === 0) {
            value = JSON.parse(value)
          }
          params.args.push(value)
        }
      }

      write(
        params.contract, 
        params.method, 
        params.args, 
        _ => notify('success', 'Done!'), 
        e => notify('error', e.message || e)
      )
      return false
    })
  )

  //------------------------------------------------------------------//
  // Initialize
})