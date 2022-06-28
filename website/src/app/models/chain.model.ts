export interface ChainModel {
    isPaused?:boolean;
    isMintWLPaused?:boolean;
    cost?:number;
    wlCost?:number;
    maxSupply?:number;
    mintedSupply?:number;
    supplyWL?:number;
    isWhiteListed?:boolean;
    addressNumberMinted?:number;
    wlMaxMint?:number; 

 
    TREASURY?:string;
    MAX_SUPPLY?:number;
    MINT_PRICE?:number;
    MAX_PER_WALLET?:number;
    MAX_FREE_PER_WALLET?:number;
    minted?:number;
    saleStarted?:boolean; 
    ownerTokens?:any[];
    tokenData?:any[]
}
