((window) => {
  const providers = {};

  class MetaMask {
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
     * @returns {MetaMask}
     */
    static addNetwork(name, config) {
      //GUIDE:
      // const {
      //  chain_id, 
      //  chain_symbol, 
      //  chain_name, 
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
      const BN = this.web3().utils.BN
      return new BN(num)
    }

    /**
     * Returns true if MetaMask wallet is connected
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
      const addresses = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (typeof index === 'number') {
        return addresses[index];
      }
      return addresses;
    }

    /**
     * Returns true if MetaMask is installed
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
      const {network: networks, abi: abis} = config;
      for (const networkName in networks) {
        const {
          chain_id,
          chain_symbol,
          chain_name,
          chain_uri,
          chain_scanner,
          chain_marketplace
        } = networks[networkName];

        this.addNetwork(networkName, {
          chain_id,
          chain_symbol,
          chain_name,
          chain_uri,
          chain_scanner,
          chain_marketplace
        });

        const network = this.network(networkName);
        for(const contractName in networks[networkName].contracts) {
          //if there's no abi
          if (!Array.isArray(abis[contractName])) {
            //we need to skip this
            continue;
          }

          const { 
            type, 
            symbol, 
            decimals, 
            image 
          } = networks[networkName].contracts[contractName];

          network.addContract(
            contractName, 
            networks[networkName].contracts[contractName].address,
            abis[contractName],
            { 
              type, 
              symbol, 
              decimals, 
              image 
            }
          );
        }

      }
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
      } else if (format === 'int') {
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
      if (!providers[rpc]) {
        if (rpc === 'metamask') {
          providers[rpc] = new Web3(window.ethereum);
        } else if (MetaMask.networks[rpc]) {
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
      //  chain_uri, 
      //  chain_scanner, 
      //  chain_marketplace
      // } = config;
      this.config = config;
    }

    /**
     * Returns true if the MetaMask wallet active network is this
     * 
     * @returns {Boolean}
     */
    async active() {
      return (await MetaMask.connected())
        && (await MetaMask.currentNetwork()) == this.config.chain_id;
    }

    /**
     * Adds this network to the MetaMask Wallet
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
        chain_name, 
        chain_symbol, 
        chain_uri, 
        chain_scanner
      } = this.config;
      //make the request
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{ 
          chainId: `0x${chain_id.toString(16)}`, 
          chainName: chain_name,
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
     * Changes the MetaMask Wallet wallet network to this
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
    async connect() {
      if (!window.ethereum?.isMetaMask) {
        throw new Error(
          'Please install <a href="https://metamask.io/" target="_blank">MetaMask</a> and refresh this page.'
        );
      }
  
      try {//matching network and connecting
        const account = await MetaMask.getWalletAddresses(0);
        const networkId = await MetaMask.currentNetwork();
        if (networkId == this.config.chain_id) {
          return account;
        }
      } catch (e) {
        throw e;
      }
  
      try {//auto switch network, then matching network and connecting
        await this.changeInWallet()
        const account = await MetaMask.getWalletAddresses(0);
        const networkId = await MetaMask.currentNetwork();
        if (networkId == this.config.chain_id) {
          return account;
        }
      } catch (e) {
        throw e;
      }
  
      try {//adding network, auto  network, then matching network and connecting
        await this.addToWallet();
        await this.changeInWallet();
        const account = await MetaMask.getWalletAddresses(0);
        const networkId = await MetaMask.currentNetwork();
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
     * @param {Function} connected 
     * @param {Function} disconnected 
     */
    async connectCB(connected, disconnected) {
      const noop = function() {};
      connected = connected || noop;
      disconnected = disconnected || noop;
    
      try {
        const account = await this.connect();
        return connected({ connected: true, account });
      } catch(e) {
        disconnected({ connected: false }, e);
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
      if (!MetaMask.installed() 
        //or listening already
        || typeof this.__blockAPIListening !== 'undefined'
      ) {
        //do nothing
        return this;
      }

      //start listening

      //window.ethereum.on('connect', validate.bind(null, 'connect'))
      window.ethereum.on('disconnect', disconnected)
      
      window.ethereum.on('chainChanged', async (params) => {
        if (this.config.chain_id !== parseInt(params, 16)) {
          return disconnected({ connected: false })
        }

        return connected({ 
          connected: true,
          account: await MetaMask.getWalletAddresses(0) 
        })
      })

      window.ethereum.on('accountsChanged', async (params) => {
        if (!Array.isArray(params) 
          || params.length === 0
          || this.config.chain_id !== parseInt(params, 16)
        ) {
          return disconnected({ connected: false }, new Error('Network Changed'))
        }

        return connected({ 
          connected: true,
          account: await MetaMask.getWalletAddresses(0) 
        })
      })

      window.__blockAPIListening = true
  
      return this
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
      if (listen) {
        this.listenToWallet(connected, disconnected);
      }

      if (await this.active()) {
        const account = await MetaMask.getWalletAddresses(0);
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
      const libWeb3 = MetaMask.web3();
      const readWeb3 = MetaMask.web3(network.config.chain_uri);
      this.resource = new libWeb3.eth.Contract(abi, address);
      this.readResource = new readWeb3.eth.Contract(abi, address)
      this.abi = abi;
      this.config = config;
      this.network = network;
      this.address = address;
    }

    /**
     * Adds contract to MetaMask wallet
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

        methods[method.name] = async function(account, value, ...args) {
          const params = { to: self.address, from: account };
          if (/^[0-9]+$/ig.test(String(value))) {
            params.value = String(MetaMask.web3().utils.toHex(value))
          }

          const rpc = self.resource.methods[method.name](...args);
          return await rpc.estimateGas(params);
        }.bind(this, account, value);
      }
      return methods;
    }

    /**
     * Listens for contract events
     * 
     * @param {String} event 
     * @param {Function} callback 
     * 
     * @returns {Function} the unsubscribe callback
     */
    on(event, callback) {
      return this.resource.events[event]({}, callback).unsubscribe
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
        if (method.stateMutability !== 'view' && method.stateMutability !== 'pure') {
          continue;
        }

        methods[method.name] = async function(...args) {
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
        methods[method.name] = function(account, value, ...args) {
          //default params
          const params = { to: self.address, from: account };
          //if there is a valid value
          if (/^[0-9]+$/ig.test(String(value))) {
            //this is payable, and lets add to params
            params.value = String(MetaMask.web3().utils.toHex(value))
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

  MetaMask.Network = Network;
  MetaMask.Contract = Contract;
  window.MetaMaskSDK = MetaMask;
})(window)