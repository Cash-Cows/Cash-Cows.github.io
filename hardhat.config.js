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
    goerli: {
      url: 'https://goerli.infura.io/v3/2a7154bb1cf244d9a412d1925398058c',
      chainId: 5,
      scanner: 'https://goerli.etherscan.io',
      opensea: 'https://testnets.opensea.io',
      accounts: [process.env.BLOCKCHAIN_GOERLI_PRIVATE_KEY],
      contracts: {
        nft: '0x94EDC644f44D7ad7B85520af6895146d56856Da8',
        treasury: '0xC821c79Ca56F0E8264accE343b6c78F5DbE77D82',
        metadata: '0x99758E4E9A1c7B5cf2D3712Be988d24C334e82f3',
        milk: '0x8Ec8Cc5A9a027Cb1e9B77B7db16534b1Da0513AD',
        index: '0xC1BD278934f830Ccab69E9B708f079703AFa924d',
        culling: '0x043F962F873312c57aBb6EAdfdF221A86EbE2A13',
        barn: '0x7De91a512De2Ab5065cED54853A2f5AF68E8E077',
        dolla: '0x5E7c36f3508de82505f417395dE49a68187d1FD2',
        market: '0xf01436C55B53AFAfEf04E97508ea7b9B346D7a33',
        loot: '0x10d25Fb3bF1dC00962a8f261aB6FDaE0CC30A0c0',
        game: '0x8374A986c9Bd82dD8755820aA00ec464E8608552',
        store: '0xb42576984e371A96305dc1336fb53D0227094399'
      }
    },
    ethereum: {
      url: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      chainId: 1,
      scanner: 'https://etherscan.io',
      opensea: 'https://opensea.io',
      accounts: [
        process.env.BLOCKCHAIN_ETHEREUM_PRIVATE_KEY, 
        process.env.BLOCKCHAIN_GOERLI_PRIVATE_KEY
      ],
      contracts: {
        nft: '0x1A371de4634c3DEBf7196A1EFc59e620aff0915F',
        treasury: '0x837844a20cFe576057b58bcF6f1556BF6795FB2F',
        metadata: '0xeb41c53e2Debf30C168fc743BA58dAd2345A0113',
        milk: '0x981E826E1238213b6848EFD54015BA83F48406Ba',
        index: '0x8d75c9d0F3AF4A0eC3440a00d997b59C99814cFf',
        culling: '0xAC5C4C50B01C2e161c7c4486A9a60bE6FA312bF7',
        barn: '0xbf18100819715323edB76bFafBdCe3caC11E31F5',
        dolla: '0xa61a3d600db91942E0BD36EA7f1a8f9cc7F99086',
        market: '0x1Ae6eEc3bdd7BB7444456cBC4dE519FFa59fA344',
        loot: '0xab8939081498301E35685EbA998ba8120844A6bD'
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
    gasPrice: 20
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
