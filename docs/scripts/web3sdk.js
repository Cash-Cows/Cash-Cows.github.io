((window) => {
  class Web3SDK {
    /**
     * @param {Object} mapping of networks
     */
    static networks = {};

    /**
     * Adds a network (like ethereum, polygon) for future use
     * 
     * @param {String} name 
     * @param {Object} config 
     * 
     * @returns {Web3SDK}
     */
    static addNetwork(name, config) {
      //GUIDE:
      // const {
      //  chain_id, 
      //  chain_symbol, 
      //  chain_name, 
      //  chain_label, 
      //  chain_uri, 
      //  chain_scanner, 
      //  chain_marketplace
      // } = config;
      this.networks[name] = new Network(config);
      return this;
    }
 
    /**
     * Returns Big Number instance
     * 
     * @param {String|Number} num
     *  
     * @returns BigNumber 
     */
    static toBigNumber(num) {
      const BN = this.web3().utils.BN;
      return new BN(num);
    }

    /**
     * Returns true if Web3SDK wallet is connected
     * 
     * @returns {Boolean}
     */
    static async connected() {
      return this.installed() 
        && (await (this.web3().eth.getAccounts())).length > 0;
    }
 
    /**
     * Returns the chain id of the current network
     * 
     * @returns {Number}
     */
    static async currentNetwork() {
      return await window.ethereum.request({ method: 'net_version' });
    }
 
    /**
     * Returns a list of connected wallet addresses
     * 
     * @returns {String|String[]} 
     */
    static async getWalletAddresses(index) {
      const addresses = await Web3SDK.web3().eth.getAccounts()
 
      if (typeof index === 'number') {
        return addresses[index];
      }
      return addresses;
    }
 
    /**
     * Returns true if Web3SDK is installed
     * 
     * @returns {Boolean}
     */
    static installed() {
      return !!(window.ethereum?.request);
    }
     
    /**
     * Returns a new network instance
     * 
     * @param {String} name 
     * 
     * @returns {Network}
     */
    static network(name) {
      if (!(this.networks[name] instanceof Network)) {
        throw new Error(`Network ${name} not found`);
      }
      return this.networks[name];
    }
 
    /**
     * Sets up the SDK from a massive config file
     * 
     * @param {Object} config 
     */
    static setup(config) {
      const {
        chain_id,
        chain_symbol,
        chain_name,
        chain_label,
        chain_uri,
        chain_scanner,
        chain_marketplace,
        contracts
      } = config

      this.addNetwork(chain_name, {
        chain_id,
        chain_symbol,
        chain_name,
        chain_label,
        chain_uri,
        chain_scanner,
        chain_marketplace
      });

      const network = this.network(chain_name);
      for(const name in contracts) {
        //if there's no abi
        if (!Array.isArray(contracts[name].abi)) {
          //we need to skip this
          continue;
        }

        const { 
          type, 
          symbol, 
          decimals, 
          image 
        } = contracts[name];

        network.addContract(
          name, 
          contracts[name].address,
          contracts[name].abi,
          { 
            type, 
            symbol, 
            decimals, 
            image 
          }
        );
      }
    }

    /**
     * Sets up the SDK from a remote json file
     * 
     * @param {Object} config 
     */
    static async setupJSON(url) {
      const response = await fetch(url);
      Web3SDK.setup(await response.json())
    }
 
    /**
     * Converts wei to ether
     * 
     * @param {String|Number} num 
     * @param {String} format 
     * 
     * @returns {String} 
     */
    static toEther(num, format) {
      const libWeb3 = this.web3()
      if (format === 'string') {
        return libWeb3.utils.fromWei(String(num)).toString()
      } else if (format === 'comma') {
        return libWeb3.utils.fromWei(String(num)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      } else if (format === 'number') {
        return parseFloat(libWeb3.utils.fromWei(String(num)).toString());
      }
      return libWeb3.utils.fromWei(String(num))
    }
   
    /**
     * Converts ether to wei
     * 
     * @param {String|Number} num 
     * 
     * @returns {String} 
     */
    static toWei(num) {
      return this.web3().utils.toWei(String(num)).toString()
    }
 
    /**
     * Returns a web3 instance (singleton)
     *
     * @returns {Web3}
     */
    static web3(rpc = 'metamask') {
      if (typeof rpc !== 'string') {
        return new Web3(rpc);
      } else if (!providers[rpc]) {
        if (rpc === 'metamask') {
          providers[rpc] = new Web3(window.ethereum);
        } else if (Web3SDK.networks[rpc]) {
          providers[rpc] = new Web3(
            new Web3.providers.HttpProvider(
             networks[rpc].config.chain_uri
            )
          );
        } else {
          providers[rpc] = new Web3(
            new Web3.providers.HttpProvider(rpc)
          );
        }
      }
 
      return providers[rpc];
    }
  }

  class Network {
    /**
     * @param {Object} mapping of contracts
     */
    contracts = {};

    /**
     * Adds the network config
     * 
     * @param {Object} config 
     */
    constructor(config) {
      //GUIDE:
      // const {
      //  chain_id, 
      //  chain_symbol, 
      //  chain_name, 
      //  chain_label,
      //  chain_uri, 
      //  chain_scanner, 
      //  chain_marketplace
      // } = config;
      this.config = config;
    }

    /**
     * Returns true if the Web3SDK wallet active network is this
     * 
     * @returns {Boolean}
     */
    async active() {
      return (await Web3SDK.connected())
       && (await Web3SDK.currentNetwork()) == this.config.chain_id;
    }

    /**
     * Adds this network to the Web3SDK Wallet
     * 
     * @returns {Network}
     */
    async addToWallet() {
      //if this network is already active
      if (await this.active()) {
       //there's no need to add
       return this;
      }
      //get settings from config
      const { 
       chain_id, 
       chain_label, 
       chain_symbol, 
       chain_uri, 
       chain_scanner
      } = this.config;
      //make the request
      await window.ethereum.request({
       method: 'wallet_addEthereumChain',
       params: [{ 
         chainId: `0x${chain_id.toString(16)}`, 
         chainName: chain_label,
         rpcUrls:[ chain_uri ],                 
         blockExplorerUrls:[ chain_scanner ],  
         nativeCurrency: { 
           symbol: chain_symbol,   
           decimals: 18
         }       
       }]
      });
      return this;
    }

    /**
     * Add a contract
     * 
     * @param {String} name 
     * @param {String} address 
     * @param {Object[]} abi
     *  
     * @returns {Network}
     */
    addContract(name, address, abi, config) {
      this.contracts[name] = new Contract(this, address, abi, config);
      return this;
    }

    /**
     * Changes the Web3SDK Wallet wallet network to this
     * 
     * @returns {Network} 
     */
    async changeInWallet() {
      //if this network is already active
      if (await this.active()) {
       //there's no need to change
       return this;
      }

      await window.ethereum.request({
       method: 'wallet_switchEthereumChain',
       params: [{ chainId: `0x${this.config.chain_id.toString(16)}` }],
      });
      return this;
    }

    /**
     * Connects wallet to this network
     * 
     * @returns {String} account address
     */
    async connect(providerOptions) {
      const modal = new Web3SDK.Web3Modal({
        providerOptions, // required
        cacheProvider: false, // optional
        disableInjectedProvider: false, // optional. For Web3SDK / Brave / Opera.
      });

      await modal.connect();

      try {//matching network and connecting
        const account = await Web3SDK.getWalletAddresses(0);
        const networkId = await Web3SDK.currentNetwork();
        if (networkId == this.config.chain_id) {
          return account;
        }
      } catch (e) {
        throw e;
      }

      try {//auto switch network, then matching network and connecting
        await this.changeInWallet()
        const account = await Web3SDK.getWalletAddresses(0);
        const networkId = await Web3SDK.currentNetwork();
        if (networkId == this.config.chain_id) {
          return account;
        }
      } catch (e) {
        throw e;
      }
  
      try {//adding network, auto  network, then matching network and connecting
        await this.addToWallet();
        await this.changeInWallet();
        const account = await Web3SDK.getWalletAddresses(0);
        const networkId = await Web3SDK.currentNetwork();
        if (networkId == this.config.chain_id) {
          return account;
        }
      } catch (e) {
        throw e
      }

      throw new Error('Could not connect');
    }

    /**
     * Connects wallet to this network
     * 
     * @returns {String} account address
     */
    async connectRPC({ message, domain, uri, providers, nonceURL, loginURL }) {
      //we need to get the nonce
      let response = await fetch(nonceURL);
      let json = await response.json();
      if (json.error) {
       throw new Error(json.message);
      } else if (!json.results?.nonce) {
       throw new Error('Nonce not found');
      }

      const nonce = json.results.nonce;
      const provider = await this.connect(providers);

      //load web3
      const web3 = Web3SDK.web3(provider);
      //sign message
      const { eip4361, signature, address } = await this.sign(
        { domain, uri, nonce, message }, 
        web3
      );

      //make form data
      const data = new URLSearchParams();
      data.append('address', address);
      data.append('message', message);
      data.append('eip4361', eip4361);
      data.append('signature', signature);
      //remote login
      response = await fetch(loginURL, { method: 'post', body: data });
      json = await response.json();
      if (json.error) {
       throw new Error(json.message);
      }
      
      return { auth: json.results, provider };
    }

    /**
     * Connects wallet to this network
     * 
     * @param {Function} connected 
     * @param {Function} disconnected 
     */
    async connectCB(providerOptions, connected, disconnected, listen) {
      disconnected = disconnected || function() {};
    
      try {
        const account = await this.connect(providerOptions);
        if (listen) {
          this.listenToWallet(connected, disconnected);
        }
        window.ethereum.emit('web3sdk-connected', { connected: true, account })
        return connected({ connected: true, account });
      } catch(e) {
        window.ethereum.emit('web3sdk-disconnected', { connected: false, account: undefined })
        disconnected({ connected: false, account: undefined }, e);
      }
    }

    /**
     * Returns a contract instance
     * 
     * @param {String} name
     *  
     * @returns {Web3.Contract}
     */
    contract(name) {
      if (!(this.contracts[name] instanceof Contract)) {
       throw new Error(`Contract ${name} not found`);
      }
      return this.contracts[name];
    }

    /**
     * Listens to various wallet state changes and determines if it is 
     * connected or disconnected
     * 
     * @param {Function} connected 
     * @param {Function} disconnected 
     * 
     * @returns {Network} 
     */
    listenToWallet(connected, disconnected) {
      //if not installed
      if (!Web3SDK.installed()) {
       //do nothing
       return this;
      }

      //start listening
      window.ethereum.on('web3sdk-connected', connected)
      window.ethereum.on('web3sdk-disconnected', disconnected)

      window.ethereum.on('disconnect', disconnected)
      
      window.ethereum.on('chainChanged', async (params) => {
       if (this.config.chain_id !== parseInt(params, 16)) {
         return disconnected({ connected: false }, new Error('Network Changed'))
       }

       return connected({ 
         connected: true,
         account: await Web3SDK.getWalletAddresses(0) 
       })
      })

      window.ethereum.on('accountsChanged', async (params) => {
       if (!Array.isArray(params) 
         || params.length === 0
         || this.config.chain_id !== parseInt(params, 16)
       ) {
         return disconnected({ connected: false }, new Error('Account Changed'))
       }

       return connected({ 
         connected: true,
         account: await Web3SDK.getWalletAddresses(0) 
       })
      })
  
      return this
    }

    async sign(payload, web3) {
      web3 = web3 || Web3SDK.web3();

      let { domain, uri, nonce, message } = payload
      domain = domain || window.location.host;
      uri = uri || window.location.href;

      const address = await Web3SDK.getWalletAddresses(0);

      const spec = [
        `${domain} wants you to sign in with your Ethereum account:`,
        `${address}`,
        '',
        `${message}`,
        '',
        `URI: ${uri}`,
        `Version: 1`,
        `Chain ID: ${this.config.chain_id}`,
        `Nonce: ${nonce}`,
        `Issued At: ${new Date().toISOString()}`
      ];

      message = spec.join("\n");

      const signature = await web3.eth.personal.sign(message, address);
      return { address, message, eip4361: message, signature }
      //console.log(web3.eth.accounts.recover(message, signed))
    }

    /**
     * Captures the current wallets state and determines if the wallet 
     * is connected or not
     * 
     * @param {Function} connected 
     * @param {Function} disconnected 
     * @param {Boolean} listen 
     */
    async startSession(connected, disconnected, listen) {
      if (await this.active()) {
       const account = await Web3SDK.getWalletAddresses(0);
       if (listen) {
        this.listenToWallet(connected, disconnected);
       }
       return connected({ connected: true, account }, true);
      }
      return disconnected({ connected: false }, new Error('Network Changed'), true);
    }
  }

  class Contract {
    /**
     * Sets the address, config, abi
     * 
     * @param {String} address 
     * @param {Object[]} abi 
     * @param {Object} config 
     */
    constructor(network, address, abi, config = {}) {
      const libWeb3 = Web3SDK.web3();
      const readWeb3 = Web3SDK.web3(network.config.chain_uri);
      this.resource = new libWeb3.eth.Contract(abi, address);
      this.readResource = new readWeb3.eth.Contract(abi, address)
      this.abi = abi;
      this.config = config;
      this.network = network;
      this.address = address;
    }

    /**
     * Adds contract to Web3SDK wallet
     * 
     * @returns {Contract}
     */
    async addToWallet() {
      //extract token variables
      const { 
       type, 
       symbol, 
       decimals, 
       image 
      } = this.config;
      //request to watch the asset
      await window.ethereum.request({
       method: 'wallet_watchAsset',
       params: {
         type,
         options: {
           address: this.address, // The address that the token is at.
           symbol: symbol, // A ticker symbol or shorthand, up to 5 chars.
           decimals: decimals, // The number of decimals in the token
           image: image, // A string url of the token logo
         }
       }
      });
      return this;
    }

    /**
     * Returns a set of methods that estimage the gas
     * 
     * @param {String} account 
     * @param {String|Number} value 
     * 
     * @returns {Object} a mapping of methods 
     */
    gas(account, value) {
      const methods = {};
      const self = this;
      for (const method of this.abi) {
       if (method.stateMutability !== 'payable' 
         && method.stateMutability !== 'nonpayable'
       ) {
         continue;
       }

       const name = method.inputs?.length 
        ? `${method.name}(${method.inputs.map(input => input.type).join(',')})`
        : method.name
       methods[name] = methods[method.name] = async function(account, value, ...args) {
         const params = { to: self.address, from: account };
         if (/^[0-9]+$/ig.test(String(value))) {
           params.value = String(Web3SDK.web3().utils.toHex(value))
         }

         const rpc = self.resource.methods[method.name](...args);
         return await rpc.estimateGas(params);
       }.bind(this, account, value);
      }
      return methods;
    }

    /**
     * Returns a set of methods that read to the blockchain
     * 
     * @param {String} account 
     * @param {String|Number} value 
     * 
     * @returns {Object} a mapping of methods 
     */
    read() {
      const methods = {};
      const self = this;
      for (const method of this.abi) {
       if (method.stateMutability !== 'view') {
         continue;
       }

       const name = `${method.name}(${method.inputs.map(input => input.type).join(',')})`
       methods[name] = methods[method.name] = async function(...args) {
         return await self.readResource.methods[method.name](...args).call();
       };
      }
      return methods;
    }

    /**
     * Returns a set of methods that write to the blockchain
     * 
     * @param {String} account 
     * @param {String|Number} value 
     * 
     * @returns {Object} a mapping of methods 
     */
    write(account, value, observers) {
      const methods = {};
      const self = this;
      const noop = function() {};

      //if observers is a number
      if (typeof observers === 'number') {
       //observers is the number of confirmations
       const confirmations = observers;
       //re-setup observers
       observers = {
         hash: function(resolve, reject, hash) {
           notify(
            'success', 
            `Transaction started on <a href="${self.network.config.chain_scanner}/tx/${hash}" target="_blank">
              ${self.network.config.chain_scanner}
            </a>. Please stay on this page and wait for ${confirmations} confirmations...`,
            1000000
           )
         },
         confirmation: function(resolve, reject, confirmationNumber, receipt) {
           if (confirmationNumber > confirmations) return
           if (confirmationNumber == confirmations) {
            notify('success', `${confirmationNumber}/${confirmations} confirmed on <a href="${self.network.config.chain_scanner}/tx/${receipt.transactionHash}" target="_blank">
              ${self.network.config.chain_scanner}
            </a>. Please stay on this page and wait for ${confirmations} confirmations...`)
            resolve()
            return
           }
           notify('success', `${confirmationNumber}/${confirmations} confirmed on <a href="${self.network.config.chain_scanner}/tx/${receipt.transactionHash}" target="_blank">
            ${self.network.config.chain_scanner}
           </a>. Please stay on this page and wait for ${confirmations} confirmations...`, 1000000)
         },
         receipt: function(resolve, reject, receipt) {
           notify(
            'success', 
            `Confirming on <a href="${self.network.config.chain_scanner}/tx/${receipt.transactionHash}" target="_blank">
              ${self.network.config.chain_scanner}
            </a>. Please stay on this page and wait for ${confirmations} confirmations...`,
            1000000
           )
         }
       }
      //if observers is not an object
      } else if (typeof observers !== 'object') {
       //make it into an object
       observers = {}
      }
      
      //map observer callbacks
      observers.transactionHash = observers.transactionHash || observers.hash || noop;
      observers.confirmation = observers.confirmation || noop;
      observers.receipt = observers.receipt || noop;

      //loop through methods in the abi
      for (const method of this.abi) {
       //if it is not a valid write method
       if (method.stateMutability !== 'payable' 
         && method.stateMutability !== 'nonpayable'
       ) {
         //skip
         continue;
       }

       //define the new method
       const name = method.inputs?.length 
        ? `${method.name}(${method.inputs.map(input => input.type).join(',')})`
        : method.name
       methods[name] = methods[method.name] = function(account, value, ...args) {
         //default params
         const params = { to: self.address, from: account };
         //if there is a valid value
         if (/^[0-9]+$/ig.test(String(value))) {
           //this is payable, and lets add to params
           params.value = String(Web3SDK.web3().utils.toHex(value))
         }

         return new Promise(async (resolve, reject) => {
           //get the method rpc
           const rpc = self.resource.methods[method.name](...args).send(params);

           //listen to observers
           rpc.on('transactionHash', observers.transactionHash.bind(
            observers, 
            resolve, 
            reject
           ));

           rpc.on('confirmation', observers.confirmation.bind(
            observers, 
            resolve, 
            reject
           ));

           rpc.on('receipt', observers.receipt.bind(
            observers, 
            resolve, 
            reject
           ));

           try {
            await rpc
           } catch(e) {
            reject(e)
           }
         })

       }.bind(this, account, value);
      }
      return methods;
    }
  }

  const providers = {};
  Web3SDK.Web3Modal = window.Web3Modal.default
  Web3SDK.Network = Network;
  Web3SDK.Contract = Contract;
  window.Web3SDK = Web3SDK;
})(window)