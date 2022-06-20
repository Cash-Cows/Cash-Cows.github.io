// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = { 
  production: false,
  env:"-local", 
  firebaseConfig : {
    apiKey: "AIzaSyBRF3Yjq0uHK4bavno4HSQZFrPDO53Usv8",
    authDomain: "koalatee-e02f9.firebaseapp.com",
    projectId: "koalatee-e02f9",
    storageBucket: "koalatee-e02f9.appspot.com",
    messagingSenderId: "549325201176",
    appId: "1:549325201176:web:692d2e0e092143cd4d086d",
    measurementId: "G-TKCBSYS1BB"
  }, 
  configchain:{  
    "CONTRACT_ADDRESS": "0x8d87Ab1c12e45A6D30eE0cFDCa78eC8224C800ce", 
    "CONTRACT_ADDRESS_ROYALTY": "0x588D297Ec62a185871B1CFf9863f0F4b2f9EC497", 
    "NETWORK": { 
      "NAME": "Rinkeby Test Network",
      "SYMBOL": "ETH",
      "ID": 4,
      "RPCURL": "https://rinkeby.infura.io/v3/",
      "blockExplorerUrls" : "https://rinkeby.etherscan.io/"
    },
    "GAS_LIMIT": 600000, 
    "SCAN_LINK": "https://rinkeby.etherscan.io/address/0xD6E2fb57c846086da78cc69E40dCBba5e3588f84" 
  } 
};
 