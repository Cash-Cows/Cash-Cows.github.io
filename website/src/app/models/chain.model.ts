export interface ChainModel {  
    TREASURY?:string;
    MAX_SUPPLY?:number;
    MINT_PRICE?:number;
    MAX_PER_WALLET?:number;
    totalSupply?:number;
    MAX_FREE_PER_WALLET?:number;
    minted?:number;
    saleStarted?:boolean; 
    ownerTokens?:any[];
    tokenData?:any[]
}
