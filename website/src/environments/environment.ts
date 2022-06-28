// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = { 
  production: false,
  env:"-local", 
  firebaseConfig : {
    apiKey: "AIzaSyBLG2n36sXcVj5YbyK3U-fyxjdFDGG7VPg",
    authDomain: "wearecashcows-fce5c.firebaseapp.com",
    projectId: "wearecashcows-fce5c",
    storageBucket: "wearecashcows-fce5c.appspot.com",
    messagingSenderId: "673149956040",
    appId: "1:673149956040:web:721a09b68463290482dafd",
    measurementId: "G-JMQGCBJQLZ"
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

// configchain:{  
//   "CONTRACT_ADDRESS": "0xD6E2fb57c846086da78cc69E40dCBba5e3588f84", 
//   "NETWORK": { 
//     "NAME": "Polygon",
//     "SYMBOL": "Matic",
//     "ID": 137,
//     "RPCURL": "https://polygon-rpc.com/",
//     "blockExplorerUrls" : "https://polygonscan.com/"
//   },
//   "GAS_LIMIT": 600000, 
//   "SCAN_LINK": "https://polygonscan.com/address/0xD6E2fb57c846086da78cc69E40dCBba5e3588f84" 
// } 
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI. 

// reveal         ipfs://QmVM6hjrUMy41RTCYXMcXdYtN5yFN27uv2vHqFFs3cygGr/ 
// not-reveal     ipfs://QmaLMwxskH7T4EbzccAUvGJwHms4jc2tzrT2R6RE2YmGvt/hidden.json



// =============== SETUP ===============
// deploy contract 
// double check the public pause and wl pause;
// double check the cost and wl cost; 
// set up the whitelisted ex; ["0x07c6e755D672127c44C5b328ace95ec8A1F8392B","0x16a43a9DE80F8b288F8a95D8f9912c1d158FC78D"]
// setisMintWLPause = false

// =============== TEST WHITELIST ===============
// Variables
// test 1 : yes 0x07c6e755D672127c44C5b328ace95ec8A1F8392B
// test 2 : yes 0x16a43a9DE80F8b288F8a95D8f9912c1d158FC78D
// test 3 : no 0x27eB677A33DcFAce489d005dd93681435d6D2D96

// =============== Whitelist test scenarios ===============
// Test #3 mint presale : expected result (NOT_WHITELISTED)
// Test #1 mint presale + 0 wei or > 10000000000000000 wei + 1 token: expected result (INVALID_AMOUNT)
// Test #1 mint presale + 0 wei or < 10000000000000000 wei + 2 token: expected result (INVALID_AMOUNT) : "Should 20000000000000000 wei
// Test #1 mint presale but < 2 will mint (EXCEED_PRESALE_MINT_LIMIT)
// // Repeat #2 #3
// // Add Test #3 to whitelisted
// Test #3 mint presale then the whitelist supplies will occur (NOT_ENOUGH_SUPPLIES_FOR_WHITELIST)

// // Public mint
// // Owner Mint


// =============== Reveal test scenario ===============
// Call the  reveal(true,baseURI)

// =============== Withdraw ===============
// 10% dev
// 90% project wallet







// Whitelist Mode
// setPause = true;
// setisMintWLPause = false;


// Public Mode
// setisMintWLPause = true;
// setPause = false;