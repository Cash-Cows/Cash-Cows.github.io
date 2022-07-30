import { Component, OnInit } from '@angular/core'; 
import { LoadingController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { ChainModel } from '../models/chain.model';
import { ConnectwalletService } from '../utils/connectwallet.service';
import { ToastMessageService } from '../utils/toast-message.service';
import * as authorized from './authorized.json';
@Component({
  selector: 'app-mint',
  templateUrl: './mint.page.html',
  styleUrls: ['./mint.page.scss'],
})
export class MintPage implements OnInit { 
  maxMint = 10;
  maxFree = 7;
  numMint=0;
  receiptDisplay='';
  myUserAddress = null;
  isChainLoaded = false;
  chainModel:ChainModel = {}; 
  config = environment.configchain;
  env= environment;
  ethereum= (<any>window).ethereum; 
  

  constructor(
    private connectWallet:ConnectwalletService,
    private loadingController:LoadingController,
    private toast:ToastMessageService) { 
      
      var _this = this;  
      if(this.ethereum){
        this.ethereum.on("accountsChanged", async (accounts) => {  
          _this.myUserAddress = null;
          await _this.onConnectWallet();  
        });
        this.ethereum.on("chainChanged", async () => { 
          _this.myUserAddress = null;
          await _this.onConnectWallet();   
        });
        this.ethereum.on("close", (error) => { 
            console.log("Errorethereum",error);
        });
      }
  }

  ngOnInit() {  
  }

  async onConnectWallet(){
    if(!this.myUserAddress){ 
      await this.connectWallet.connect();
      await this.onRefreshChainData();
    }
  }

  async onRefreshChainData(){
    return new Promise<any>(async resolve=>{ 
      const loading = await this.loadingController.create({ message: "Please wait ...."  });
      await loading.present();  

      this.myUserAddress = this.connectWallet.userAddress; 
      this.chainModel.TREASURY =  await this.connectWallet.contract.methods.TREASURY().call(); 
      this.chainModel.MAX_SUPPLY =  parseInt(await this.connectWallet.contract.methods.MAX_SUPPLY().call());
      this.chainModel.MINT_PRICE =  parseInt(await this.connectWallet.contract.methods.MINT_PRICE().call());
      this.chainModel.MAX_PER_WALLET =  parseInt(await this.connectWallet.contract.methods.MAX_PER_WALLET().call());
      this.chainModel.totalSupply =  parseInt(await this.connectWallet.contract.methods.totalSupply().call());
      this.chainModel.MAX_FREE_PER_WALLET =  parseInt(await this.connectWallet.contract.methods.MAX_FREE_PER_WALLET().call());
      this.chainModel.minted =  parseInt(await this.connectWallet.contract.methods.minted(this.myUserAddress).call());
      this.chainModel.saleStarted =  await this.connectWallet.contract.methods.saleStarted().call(); 

      console.log(this.chainModel ); 

      this.isChainLoaded = true; 

      await loading.dismiss();
      this.onReceipt();
      resolve({});
    });
  } 


  async onMint(){
    let gasLimit = this.config.GAS_LIMIT; 
    await this.animatePull();
    if(!this.myUserAddress){
      this.toast.presentToast("Wallet is not yet connected");
      return;
    }
    if(!this.env.isStartedMint){
      this.toast.presentToast("Soon...");
      return;
    }
 
    if(this.numMint <= 0){
      this.toast.presentToast("Number of mint must greater than zero.");
      return;
    }

    if(this.chainModel.MAX_SUPPLY == this.chainModel.totalSupply){
      this.toast.presentToast("Sold out");
      return;
    }
    if(this.chainModel.MAX_SUPPLY < this.numMint){
      this.toast.presentToast("Exceed to remaining balance.");
      return;
    } 
    

    if(!this.chainModel.saleStarted){
      // Whitelist Minting
      const proof = this.getProof(this.myUserAddress); 
      if(this.maxMint < (this.chainModel.minted + this.numMint)){
        this.toast.presentToast(`Exceed to Max Mint. (Only ${this.maxMint} Max mint for whitelist)`);
        return;
      }

      if(!proof){
        this.toast.presentToast("Not listed");
        return;
      }

      let maxFree = this.maxFree ;
      if(this.maxMint < maxFree){
        this.toast.presentToast("Free mint cannot be more than max mint");
        return;
      }

      let quantity = this.numMint;
      let value  = 0; 
      let totalGasLimit = String(gasLimit * quantity);
      //if there are still some free
      if (this.chainModel.minted < maxFree) {
        //find out how much left is free
        let freeLeft = maxFree - this.chainModel.minted;
        //if some of the quantity still needs to be paid
        if (freeLeft < quantity ) { 
          value = (quantity - freeLeft) * this.chainModel.MINT_PRICE ; 
          if(((quantity - freeLeft) * this.chainModel.MINT_PRICE) > value){ 
            // and what is sent is less than what needs to be paid  
            this.toast.presentToast("Some of the quantity still needs to be paid");
            return;
          }
        }
      //the value sent should be the price times quantity
      } else {
        value = quantity * this.chainModel.MINT_PRICE; 
        if ((quantity * this.chainModel.MINT_PRICE) > value){
          this.toast.presentToast("Value sent should be the price times quantity");
          return;
        } 
      }
      console.log(quantity, this.maxMint, maxFree, proof);
      console.log({ 
        gasLimit: totalGasLimit,
        to: this.config.CONTRACT_ADDRESS,
        from: this.myUserAddress ,
        value: value 
      }); 
      await this.connectWallet.contract.methods.mint(quantity, this.maxMint, maxFree, proof).send({ 
        gasLimit: totalGasLimit,
        to: this.config.CONTRACT_ADDRESS,
        from: this.myUserAddress ,
        value: value 
      });  
    }else{
      // Public Minting
      
    } 


    // if(this.chainModel.minted < this.numMint){
    //   this.toast.presentToast("Exceed to remaining balance.");
    //   return;
    // }



    this.numMint = 0 ;
    this.onReceipt();
  }

  animatePull() {
    return new Promise<any>((resolve)=>{ 
      setTimeout(()=>{
        var a =document.getElementById("c-pull");
        a.style.transform = "rotate(180deg)";
        setTimeout(()=>{ 
            a.style.transform = "rotate(0deg)";
            resolve({});
        },800)
      },200);
    })
  }

  onReceipt(){    
    if(this.numMint == 0){
      this.receiptDisplay = '';
      return;
    }
    let maxFree = this.maxFree ;  
    let quantity = this.numMint;
    let value = 0;
    console.log(this.chainModel.minted,maxFree)
    // if (this.chainModel.minted > maxFree) {
    //   let value = quantity * this.chainModel.MINT_PRICE;   
    //   this.receiptDisplay = `Mints : ${this.numMint} for ${(value/Math.pow(10,18))} ETH`; 
    //   return;
    // }

    //if there are still some free
    if (this.chainModel.minted < maxFree) {
      //find out how much left is free
      let freeLeft = maxFree - this.chainModel.minted;
      //if some of the quantity still needs to be paid
      if (freeLeft < quantity ) { 
        value = (quantity - freeLeft) * this.chainModel.MINT_PRICE ; 
        if (value > 0){
          // and what is sent is less than what needs to be paid  
          this.receiptDisplay = `Mints : ${this.numMint} for ${(value/Math.pow(10,18))} ETH`; 
          return;
        }
      }
    //the value sent should be the price times quantity
    } else {
      value = quantity * this.chainModel.MINT_PRICE; 
      if (value > 0){
        this.receiptDisplay = `Mints : ${this.numMint} for ${(value/Math.pow(10,18))} ETH`; 
        return;
      } 
    }

    this.receiptDisplay = `Mints : ${this.numMint}`; 
  } 

  onNumMint(numMint){
    this.numMint = numMint;
    this.onReceipt();
  }

  onOpenWindow(url){
    window.open(url,"_blank");
  }

  onMouseOutClick(e,src){
    console.log("onMouseOutClick",e.target.src);
    e.target.src = src;
  }

  onMouseOverClick(e,src){
    console.log("onMouseOverClick",e.target);
    e.target.src = src;
  }
  
  getProof(address){
    return JSON.parse(JSON.stringify(authorized))[address];
  }
 
}
