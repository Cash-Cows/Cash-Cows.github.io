import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastMessageService {

  constructor( 
    private alertController:AlertController,
    private toastController : ToastController
  ) { }
  async presentToast(msg,duration=6000) {
    const toast = await this.toastController.create({
      message: msg,
      color: 'primary',
      duration: duration, 
    });
    toast.present();
  } 
   
  async errorToast(msg,duration?) {
    const toast = await this.toastController.create({
      message: msg,
      color: 'danger',
      duration: duration ? duration : 6000, 
    });
    toast.present();
  } 
  async warningToast(msg,duration?) {
    const toast = await this.toastController.create({
      message: msg,
      color: 'warning',
      duration: duration ? duration : 6000, 
    });
    toast.present();
  } 
  

  async errorAlert(message){ 
    const alert = await this.alertController.create({  
      message: message +` Please<a href="https://discord.gg/XHfd5JVtae" target="_blank"> contact</a> the developer for more information..`,
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
}
