import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { ChainModel } from '../models/chain.model';
import { ConnectwalletService } from '../utils/connectwallet.service';
import { ToastMessageService } from '../utils/toast-message.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-royalty-browser',
  templateUrl: './royalty-browser.page.html',
  styleUrls: ['./royalty-browser.page.scss'],
})
export class RoyaltyBrowserPage implements OnInit {
  myUserAddress:any;totalRoyalties=0;isLoaded=false;
  chainModel:ChainModel={};
  config= environment.configchain;
  walletConnected: boolean = false;isShowDashboard: boolean = false;
  ethereum= (<any>window).ethereum; 

  constructor(
    private http:HttpClient,
    private connectWallet:ConnectwalletService,
    private loadingController:LoadingController,
    private toast:ToastMessageService,
    private popoverController: PopoverController,
    private alertController:AlertController
  ) { 
    
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


  ngOnInit(): void {  
  }


  async onConnectWallet(){
    await this.connectWallet.connect(); 
    this.walletConnected = true;  
    await this.onRefreshChainData();
  }

  onRefreshChainData() { 
    return new Promise<any>(async resolve=>{ 
      this.isLoaded = false;
      this.isShowDashboard = true;
      this.myUserAddress = this.connectWallet.userAddress;  
      
      const loading = await this.loadingController.create({ message: "Please wait ...."  });
      // await loading.present();  
      const ownerTokens =  await this.connectWallet.contract.methods.ownerTokens(this.myUserAddress).call(); 
      this.chainModel.tokenData = [];
      this.chainModel.ownerTokens = [];
      console.log("Chain ownerTokens", ownerTokens);  

      for(let i = 0 ; i < ownerTokens.length ; i ++){
        this.chainModel.ownerTokens.push(parseInt(ownerTokens[i]));

        const tokenID = this.chainModel.ownerTokens[i];
        const tokenURI = await this.connectWallet.contract.methods.tokenURI(tokenID).call();  

        let tokenData = await new Promise<any>((resolve,reject)=>{    
          if(!environment.production){
            const headers = new HttpHeaders() 
            .set('content-type', 'application/json') ; 
            this.http.get(tokenURI,
            { headers: headers }).subscribe(async (res:any)=>{   
              resolve(res);
            })  
          }else{ 
            const headers = new HttpHeaders() 
            .set('content-type', 'application/json') ; 
            this.http.get(`https://opensea.mypinata.cloud/ipfs/${tokenURI.split('ipfs/')[1]}`,
            { headers: headers }).subscribe(async (res:any)=>{   
              res.image = `https://opensea.mypinata.cloud/ipfs/${res.image .split('ipfs/')[1]}`;
              resolve(res);
            })  
          } 
        });
 
        let royalty = parseInt(await  this.connectWallet.contractRoyalty.methods.releaseable(tokenID).call());
        royalty = royalty/Math.pow(10,18);
        tokenData = Object.assign(tokenData,{royalty});
        this.totalRoyalties += royalty;
        this.chainModel.tokenData.push(tokenData);
      }


      console.log("Chain Model", this.chainModel);  
      this.isLoaded = true;
      await loading.dismiss(); 
      resolve({});
    });
  }


  claimRoyalties(){
    return new Promise<any>(async (resolve)=>{
        
      const loading = await this.loadingController.create({ message: "Please wait ...."  });
      await loading.present();  
      let gasLimit = this.config.GAS_LIMIT;

      console.log("this.chainModel.ownerTokens",this.chainModel.ownerTokens,JSON.stringify(this.chainModel.ownerTokens),this.chainModel.ownerTokens.join(","));
      await this.connectWallet.contractRoyalty.methods.releaseBatch(this.chainModel.ownerTokens)
      .send({ 
        gasLimit: gasLimit,
        to: this.config.CONTRACT_ADDRESS_ROYALTY,
        from: this.myUserAddress  
      });
 
      
      await loading.dismiss(); 
      
      this.toast.presentToast("Claimed Successfully!");
      this.onRefreshChainData();
      resolve({});
    })
  }
  
  updateChainHoldNft(){

  }

}
