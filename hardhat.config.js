require('@nomiclabs/hardhat-etherscan');
require('@nomiclabs/hardhat-waffle');
require('hardhat-contract-sizer');
require('hardhat-gas-reporter');
require('dotenv').config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: process.env.BLOCKCHAIN_NETWORK,
  networks: {
    hardhat: {
      chainId: 1337,
      mining: {
        //set this to false if you want localhost to mimick a real blockchain
        auto: true,
        interval: 5000
      }
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      chainId: 4,
      scanner: 'https://rinkeby.etherscan.io',
      opensea: 'https://testnets.opensea.io',
      accounts: [process.env.BLOCKCHAIN_RINKEBY_PRIVATE_KEY],
      contracts: {
        nft: '0x03C048bFAd8Dd8dfe87AdaaD4463ca5D13861a2e',
        treasury: '0x5560eCb4d47BaC8744cAecCe23a1B0b20210fD63',
        metadata: '0x01acB1858aC0536a3CA2eA71fB2483796afb9186',
        token: '0x4bFDb8fa13BD9f9E946a6BDDa00907ed77b1C76a',
        index: '0xcf2e9e92E72B4f9ad243Db2c3E71E0e1c65Fcb19',
        culling: '0x98E8D05dcfDf30b9938A15861fC6eC0a48b643e4'
      }
    },
    ethereum: {
      url: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      chainId: 1,
      scanner: 'https://etherscan.io',
      opensea: 'https://opensea.io',
      accounts: [
        process.env.BLOCKCHAIN_ETHEREUM_PRIVATE_KEY, 
        process.env.BLOCKCHAIN_RINKEBY_PRIVATE_KEY
      ],
      contracts: {
        nft: '0x1A371de4634c3DEBf7196A1EFc59e620aff0915F',
        treasury: '0x837844a20cFe576057b58bcF6f1556BF6795FB2F',
        metadata: '0xeb41c53e2Debf30C168fc743BA58dAd2345A0113',
        token: '0x981E826E1238213b6848EFD54015BA83F48406Ba',
        index: '0x8d75c9d0F3AF4A0eC3440a00d997b59C99814cFf',
        culling: '0xAC5C4C50B01C2e161c7c4486A9a60bE6FA312bF7'
      }
    },
  },
  solidity: {
    version: '0.8.9',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: './contracts',
    tests: './tests',
    cache: './cache',
    artifacts: './artifacts'
  },
  mocha: {
    timeout: 20000
  },
  gasReporter: {
    currency: 'USD',
    coinmarketcap: process.env.BLOCKCHAIN_CMC_KEY,
    gasPrice: 50
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.BLOCKCHAIN_SCANNER_KEY
  },
  contractSizer: {
    //see: https://www.npmjs.com/package/hardhat-contract-sizer
    runOnCompile: true
  }
};
