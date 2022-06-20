import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { ChainModel } from '../models/chain.model';
import { ConnectwalletService } from '../utils/connectwallet.service';
import { DropDownListComponent } from '../utils/drop-down-list/drop-down-list.component';
import { ToastMessageService } from '../utils/toast-message.service';

@Component({
  selector: 'app-mint',
  templateUrl: './mint.page.html',
  styleUrls: ['./mint.page.scss'],
})
export class MintPage implements OnInit {
  myUserAddress = null;
  isChainLoaded = false;
  chainModel:ChainModel = {}; 
  config= environment.configchain;
  maxMint = 4;
  devMint =13;
  receiptDisplay="";
  userMint = 1;
  isShowMintDone=true;

  constructor(
    private connectWallet:ConnectwalletService,
    private loadingController:LoadingController,
    private toast:ToastMessageService,
    private popoverController: PopoverController,
    private alertController:AlertController
  ) { }

  ngOnInit() {
    // if(!environment.production){
    //   this.onConnectWallet();
    // }
  }

  async onConnectWallet(){
    await this.connectWallet.connect();
    await this.onRefreshChainData();
  }

  async onRefreshChainData(){
    return new Promise<any>(async resolve=>{ 
      const loading = await this.loadingController.create({ message: "Please wait ...."  });
      await loading.present(); 

      this.myUserAddress = this.connectWallet.userAddress; 
      console.log(this.myUserAddress );
      this.chainModel.isPaused =  await this.connectWallet.contract.methods.isPaused().call();
      console.log(this.chainModel.isPaused);
      this.chainModel.isMintWLPaused =  await this.connectWallet.contract.methods.isMintWLPaused().call();
      console.log(this.chainModel.isMintWLPaused);
      this.chainModel.cost =  parseInt(await this.connectWallet.contract.methods.cost().call());
      console.log(this.chainModel.cost);
      this.chainModel.wlCost =  parseInt(await this.connectWallet.contract.methods.wlCost().call());
      console.log(this.chainModel.wlCost);
      this.chainModel.maxSupply =  parseInt(await this.connectWallet.contract.methods.maxSupply().call());
      console.log(this.chainModel.maxSupply);
      this.chainModel.supplyWL =  parseInt(await this.connectWallet.contract.methods.supplyWL().call());
      console.log(this.chainModel.supplyWL);
      this.chainModel.mintedSupply = parseInt(await this.connectWallet.contract.methods.totalSupply().call());
      console.log(this.chainModel.mintedSupply);
      this.chainModel.wlMaxMint =  parseInt(await this.connectWallet.contract.methods.wlMaxMint().call());
      console.log(this.chainModel.wlMaxMint);
      this.chainModel.isWhiteListed =  await this.connectWallet.contract.methods.whitelistWallets(this.myUserAddress).call();
      console.log(this.chainModel.isWhiteListed);
      this.chainModel.addressNumberMinted =  parseInt(await this.connectWallet.contract.methods.addressNumberMinted(this.myUserAddress).call()); 
      console.log(this.chainModel.addressNumberMinted);
      if(!this.chainModel.isMintWLPaused && !this.chainModel.isWhiteListed){
        this.errorAlert("This wallet address is not whitelisted.");
        await loading.dismiss();
        return;
      }
      
      if(!this.chainModel.isMintWLPaused){
        const wlMaxMint = this.chainModel.wlMaxMint;
        const myNumberMint = this.chainModel.addressNumberMinted;
        this.maxMint = wlMaxMint - myNumberMint;
        console.log("maxMint",this.maxMint); 

        let wlSupply = this.chainModel.supplyWL;
        let totalSupply = this.chainModel.mintedSupply;
        let powerMint = this.maxMint;
        let a =  (this.devMint + wlSupply) -  totalSupply;
        if(powerMint > a ){ 
          this.maxMint = a;
        } 
        console.log("maxMint",a,this.maxMint);
      }

      if(!this.chainModel.isPaused){     
        let totalSupply =  this.chainModel.mintedSupply;
        let maxSupply = this.chainModel.maxSupply;
        let powerMint = this.maxMint;
        let a =  maxSupply -  totalSupply;  
        if(powerMint > a ){ 
          this.maxMint = a;
        } 
      }

      this.isChainLoaded = true;
      this.onReceipt();

      await loading.dismiss();
      resolve({});
    });
  } 
  
  onReceipt(){  
    if(!this.chainModel.isMintWLPaused){ 
      this.receiptDisplay = `${this.userMint} Cashcows${(this.userMint>1?'s':'')} cost for ${(this.chainModel.wlCost/Math.pow(10,18)*this.userMint).toFixed(2)} Matic`;
    }else{ 
      this.receiptDisplay = `${this.userMint} Cashcows${(this.userMint>1?'s':'')} cost for ${(this.chainModel.cost/Math.pow(10,18)*this.userMint).toFixed(2)} Matic`;
    }
  }
  
  rangeChange(ev){
    this.userMint = ev.detail.value; 
    console.log(this.userMint);
    this.onReceipt();
  }

  
  async onMint(){   
    if(!this.chainModel.isMintWLPaused && (this.devMint + this.chainModel.supplyWL) -  this.chainModel.mintedSupply == 0){
      return;
    }
    if(this.chainModel.isPaused && this.chainModel.isMintWLPaused){
      return;
    }
    if(!this.connectWallet.userAddress){
      return;
    }
    if(this.chainModel.mintedSupply == this.chainModel.maxSupply){ 
      return;
    }
    const loading = await this.loadingController.create({ message: "Please wait ...."  });
    await loading.present();

    await this.onRefreshChainData();
    if(this.chainModel.isPaused && this.chainModel.isMintWLPaused){ 
      this.toast.presentToast("Minting is under maintenance");
      return;
    } 
    let contractAddress,mintAmount,gasLimit,cost,totalCostWei,totalGasLimit;

    contractAddress = this.config.CONTRACT_ADDRESS;
    mintAmount = this.userMint;
    gasLimit = this.config.GAS_LIMIT; 
    cost  = !this.chainModel.isMintWLPaused ? this.chainModel.wlCost : this.chainModel.cost;

    totalGasLimit = String(gasLimit * mintAmount);
    
    if(this.userMint > this.maxMint){ 
      if(!this.chainModel.isMintWLPaused){
        this.toast.presentToast(`Up to ${this.chainModel.wlMaxMint} mint you can get in the whitelist period.`);
      }else{ 
        this.toast.presentToast("Exceed number of mint.");
      }
      await loading.dismiss();   
      return;
    }   

    totalCostWei = String(cost * mintAmount); 

 
    console.log("minting....",this.myUserAddress,gasLimit,totalGasLimit,mintAmount,contractAddress);
 
    try { 
      if(!this.chainModel.isMintWLPaused){

        await this.connectWallet.contract.methods.preSaleMint(mintAmount).send({ 
          gasLimit: totalGasLimit,
          to: contractAddress,
          from: this.myUserAddress 
          ,value: totalCostWei 
        });   

      }else{ 

        await this.connectWallet.contract.methods.mint(mintAmount).send({ 
          gasLimit: totalGasLimit,
          to: contractAddress,
          from: this.myUserAddress 
          ,value: totalCostWei 
        });   

      }


      await loading.dismiss();    
      this.onOpenCloseThank();

    } catch(e) { 
      await loading.dismiss();    
      if(e.code != 4001){
        this.errorAlert("Something went wrong.");
      }
    } 

  }

  async onOpenCloseThank() {
    await this.onRefreshChainData();
    this.onToggleMintDone();
  }

  async errorAlert(message){ 
    const alert = await this.alertController.create({  
      message: message +` Please<a href="https://discord.gg/XjkkYMWhBr" target="_blank"> contact</a> the developer for more information.`,
      backdropDismiss:false,
      buttons: [ {
          text: 'Ok',
          handler: async () => {  
            window.location.reload();
          }
        }
      ]
    }); 
    await alert.present();
  }

  navs=[
    {
      name:"Twitter",
      link:"https://twitter.com/CashcowsNFT"
    },
    {
      name:"Facebook",
      link:"https://www.facebook.com/CashcowsNFT"
    },
    {
      name:"Instagram",
      link:"https://instagram.com/Cashcows_collection"
    },
    {
      name:"Opensea",
      link:"https://opensea.io/collection/Cashcows"
    },
    {
      name:"Discord",
      link:"https://discord.gg/XjkkYMWhBr"
    }
  ]
  
  async onToggleMenu(ev){
    const popover = await this.popoverController.create({
      component: DropDownListComponent, 
      event: ev,
      translucent: true,
      componentProps:{
        datas:this.navs.map((e)=>{return e.name;})
      }
    });
    await popover.present();
    popover.onWillDismiss().then((data)=>{   
      window.open(this.navs.find((e)=>{return data.data.title === e.name;}).link,'_blank');
    });
  }

  onToggleMintDone(){
    this.isShowMintDone = !this.isShowMintDone;
  }

}
